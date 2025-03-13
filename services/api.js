import axios from 'axios';
import Constants from 'expo-constants';
import composioService from './composio';

// Azure OpenAI Configuration from environment
const {
  AZURE_OPENAI_API_KEY = 'your-azure-api-key',
  AZURE_OPENAI_ENDPOINT = 'https://your-resource-name.openai.azure.com',
  AZURE_OPENAI_DEPLOYMENT_NAME = 'your-deployment-name',
  MODEL_TEMPERATURE = '0.7',
  MODEL_MAX_TOKENS = '800'
} = Constants.expoConfig?.extra || {};

// Convert string values to appropriate types
const temperature = parseFloat(MODEL_TEMPERATURE);
const maxTokens = parseInt(MODEL_MAX_TOKENS, 10);

const API_VERSION = '2024-10-21'; // Exact API version from the target URI

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'api-key': AZURE_OPENAI_API_KEY
  }
});

/**
 * Default enabled tools for the agent
 * This can be customized based on user preferences or use cases
 */
const DEFAULT_ENABLED_TOOLS = [
  'GITHUB_STAR_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER',
  'GITHUB_CREATE_AN_ISSUE',
  'SLACK_SEND_MESSAGE',
  'GMAIL_SEND_EMAIL'
];

/**
 * Send a message to Azure OpenAI API
 * @param {Array} messages - Chat messages array
 * @param {Array} enabledTools - Array of tool names to enable (optional)
 * @param {Boolean} useTools - Whether to use tools or not
 * @param {Object} authStatus - Status of authenticated services
 * @returns {Object} - The assistant's response message
 */
export const sendMessage = async (
  messages, 
  enabledTools = DEFAULT_ENABLED_TOOLS, 
  useTools = true,
  authStatus = {}
) => {
  try {
    // Log environment variables (sanitized) for debugging
    console.log('Azure OpenAI Configuration:', {
      endpoint: AZURE_OPENAI_ENDPOINT ? AZURE_OPENAI_ENDPOINT.substring(0, 15) + '...' : 'not set',
      deploymentName: AZURE_OPENAI_DEPLOYMENT_NAME || 'not set',
      apiVersion: API_VERSION,
      hasApiKey: !!AZURE_OPENAI_API_KEY,
      usingTools: useTools
    });

    // Ensure the endpoint has no trailing slash before adding the path
    const normalizedEndpoint = AZURE_OPENAI_ENDPOINT.endsWith('/') 
      ? AZURE_OPENAI_ENDPOINT.slice(0, -1) 
      : AZURE_OPENAI_ENDPOINT;
    
    // Standard Azure OpenAI API URL format
    const azureApiUrl = `${normalizedEndpoint}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;
    
    // Get tools from Composio if enabled
    const tools = useTools ? composioService.getTools(enabledTools) : [];
    
    // Add system message about authentication status if tools are enabled
    let modifiedMessages = [...messages];
    
    if (useTools && tools.length > 0) {
      // Check if we have the latest system message about auth status
      const authStatusMessage = {
        role: 'system',
        content: `Authentication status: ${Object.entries(authStatus)
          .map(([service, status]) => `${service}: ${status ? 'authenticated' : 'not authenticated'}`)
          .join(', ')}. 
          
          If you need to use a service that's not authenticated, please include an authentication prompt in your response using this format: 
          "To help with this, I'll need access to your [service] account. [AUTH_REQUEST:service] 
          
          Once you grant access, I'll be able to help you with this task."
          
          Replace [service] with the actual service name (gmail, github, slack, etc.).`
      };
      
      // Check if last system message is about auth status
      const lastSystemIndex = modifiedMessages
        .map((msg, i) => msg.role === 'system' ? i : -1)
        .filter(i => i !== -1)
        .pop();
      
      if (lastSystemIndex !== undefined && modifiedMessages[lastSystemIndex].content.includes('Authentication status:')) {
        // Replace the last auth status message
        modifiedMessages[lastSystemIndex] = authStatusMessage;
      } else {
        // Add a new auth status message
        modifiedMessages.unshift(authStatusMessage);
      }
    }
    
    // Prepare the request payload
    const payload = {
      messages: modifiedMessages,
      temperature,
      max_tokens: maxTokens,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: null
    };
    
    // Add tools to the request if enabled and available
    if (useTools && tools.length > 0) {
      payload.tools = tools;
      payload.tool_choice = 'auto'; // Let the model decide when to use tools
    }
    
    // Log the request payload (excluding message content for privacy)
    console.log('Request params:', {
      messageCount: modifiedMessages.length,
      temperature,
      max_tokens: maxTokens,
      top_p: 0.95,
      toolCount: tools.length
    });
    
    const response = await api.post(azureApiUrl, payload);
    
    console.log('Response status:', response.status);
    console.log('Response has data:', !!response.data);
    
    // Get the assistant's message
    const assistantMessage = response.data.choices[0].message;
    
    // Check if the response contains tool calls
    const hasToolCalls = assistantMessage.tool_calls?.length > 0;
    
    if (hasToolCalls) {
      console.log('Response contains tool calls');
      
      // Check if we have authentication for the tools being called
      const toolNames = assistantMessage.tool_calls.map(tc => {
        // Extract the service name from the function name
        // Example: "GMAIL_SEND_EMAIL" -> "gmail"
        const serviceName = tc.function.name.split('_')[0].toLowerCase();
        return serviceName;
      });
      
      // Check if any required service is not authenticated
      const unauthenticatedServices = toolNames.filter(service => !authStatus[service]);
      
      if (unauthenticatedServices.length > 0) {
        // We need authentication for these services
        const authRequests = unauthenticatedServices.map(service => 
          `[AUTH_REQUEST:${service}]`
        ).join('\n');
        
        // Create a message asking for authentication
        return {
          role: 'assistant',
          content: `I need to access certain services to help you with this request. Please authenticate with the following services:\n\n${authRequests}\n\nOnce authenticated, I'll be able to complete your request.`
        };
      }
      
      // All required services are authenticated, proceed with tool calls
      try {
        const result = await composioService.handleToolCalls(response.data);
        console.log('Tool call results:', result);
        
        // Add a message about the tool use to help the user understand what happened
        return {
          role: 'assistant',
          content: `I've used tools to help with your request: ${assistantMessage.tool_calls.map(tc => tc.function.name).join(', ')}. ${result.result}`
        };
      } catch (error) {
        // Handle tool call failure
        return {
          role: 'assistant',
          content: `I tried to use tools to help with your request, but encountered an error: ${error.message}. Could you try again or rephrase your request?`
        };
      }
    }
    
    // Return the standard message if no tool calls
    return assistantMessage;
  } catch (error) {
    console.error('Error sending message to Azure OpenAI:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

/**
 * Authenticate with a third-party service via Composio
 * @param {String} serviceName - Name of the service to authenticate with
 * @returns {Object} - Authentication information
 */
export const authenticateService = async (serviceName) => {
  try {
    return await composioService.initAuthentication(serviceName);
  } catch (error) {
    console.error(`Error authenticating with ${serviceName}:`, error.message);
    throw error;
  }
};

// This is a fallback in case you don't have Azure credentials configured yet
export const sendMessageMock = async (messages) => {
  // Simulate API response delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const lastMessage = messages[messages.length - 1];
  
  // Simple responses for demo purposes
  return {
    role: 'assistant',
    content: `Hi there! I'm August, an AI super agent. ${lastMessage.content.includes('?') ? "As for your question, I'm just a demo response right now." : 'How can I help you today?'}`
  };
};