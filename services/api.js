import axios from 'axios';
import Constants from 'expo-constants';
import composioService from './composio';
import * as SecureStore from 'expo-secure-store';
import supabase from './supabase'; // Correct import for the default export

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

// Get configuration from environment
const {
  BACKEND_URL = 'http://localhost:3000'
} = Constants.expoConfig?.extra || {};

// Create API client with base URL
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    // First try to get the session from Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (data && data.session && data.session.access_token) {
      config.headers.Authorization = `Bearer ${data.session.access_token}`;
      console.log('Added auth token to request from Supabase session');
    } else {
      // Fallback to SecureStore if Supabase session isn't available
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Added auth token to request from SecureStore');
      } else {
        console.log('No authentication token available');
      }
    }
    return config;
  } catch (error) {
    console.error('Error adding auth token to request:', error);
    return config;
  }
});

/**
 * Test connection to the backend
 * @returns {Promise} - Promise with test result
 */
export const testBackendConnection = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/test`);
    console.log('Backend connection test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return { success: false, error };
  }
};

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
 * Send a message to the backend API (with simulated streaming for React Native)
 * @param {Array} messages - Chat messages array
 * @param {Array} enabledTools - Array of tool names to enable (optional)
 * @param {Boolean} useTools - Whether to use tools or not
 * @param {Object} authStatus - Status of authenticated services
 * @param {Function} onChunk - Callback for each chunk of the response
 * @returns {Object} - The final assistant's response message
 */
export const sendMessage = async (
  messages, 
  enabledTools = DEFAULT_ENABLED_TOOLS, 
  useTools = true,
  authStatus = {},
  onChunk = null
) => {
  try {
    // First test the connection to the backend
    const testResult = await testBackendConnection();
    console.log('Backend connection test result:', testResult);
    
    // Log API configuration for debugging
    console.log('API Configuration:', {
      backendUrl: BACKEND_URL,
      streaming: !!onChunk,
      usingTools: useTools
    });
    
    // Log request parameters for debugging
    console.log('Request params:', {
      messageCount: messages.length,
      streaming: !!onChunk,
      toolCount: enabledTools.length
    });
    
    // Get the active chat ID from the last message if available
    const chatId = messages[0]?.chatId;
    
    // Determine which endpoint to use based on whether tools are enabled and if we have a chat ID
    let endpoint;
    if (chatId) {
      // If we have a chat ID, use the chat-specific endpoint
      endpoint = `/api/chats/${chatId}/messages`;
    } else {
      // Otherwise use the Composio endpoint
      endpoint = '/api/composio/execute';
    }
    
    // If streaming is requested, use the streaming approach
    if (onChunk) {
      try {
        // Make the request to the backend
        const response = await api.post(endpoint, {
          messages,
          content: messages[messages.length - 1]?.content, // For chat-specific endpoint
          enabledTools: useTools ? enabledTools : [],
          stream: true,
          authStatus
        });
        
        // If we get here, the request was successful but didn't stream
        // This shouldn't normally happen, but we handle it just in case
        console.log('Expected streaming response but got regular response');
        
        // Create a mock message for the response
        const assistantMessage = {
          role: 'assistant',
          content: response.data.content || 'I received your message but had trouble processing it.',
          id: response.data.id || `msg-${Date.now()}`
        };
        
        // Call the chunk handler with the full message
        if (onChunk) {
          onChunk(assistantMessage);
        }
        
        return assistantMessage;
      } catch (error) {
        console.error('Error in simulated streaming request:', error);
        console.error('Error sending message to backend:', error.message);
        
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
          console.error('Response data:', error.response.data);
        }
        
        // Fall back to the mock response if backend fails
        return sendMessageMock(messages, onChunk);
      }
    } else {
      // Non-streaming request
      const response = await api.post(endpoint, {
        messages,
        content: messages[messages.length - 1]?.content, // For chat-specific endpoint
        enabledTools: useTools ? enabledTools : [],
        stream: false,
        authStatus
      });
      
      return {
        role: 'assistant',
        content: response.data.content,
        id: response.data.id
      };
    }
  } catch (error) {
    console.error('Error sending message and getting response:', error.message);
    
    // Fall back to the mock response
    return sendMessageMock(messages, onChunk);
  }
};

/**
 * Authenticate with a third-party service via backend
 * @param {String} serviceName - Name of the service to authenticate with
 * @returns {Object} - Authentication information
 */
export const authenticateService = async (serviceName) => {
  try {
    const response = await api.post(`/api/composio/auth/${serviceName}`);
    return response.data;
  } catch (error) {
    console.error(`Error authenticating with ${serviceName}:`, error.message);
    throw error;
  }
};

/**
 * Check authentication status for a tool
 * @param {String} toolName - Name of the tool to check
 * @returns {Object} - Authentication status and redirect URL if needed
 */
export const checkToolAuth = async (toolName) => {
  try {
    const response = await api.post('/api/composio/check-auth', { toolName });
    return response.data;
  } catch (error) {
    console.error(`Error checking auth for ${toolName}:`, error.message);
    throw error;
  }
};

/**
 * This is a fallback in case the backend is not available
 * @param {Array} messages - Chat messages array
 * @param {Function} onChunk - Callback for streaming updates
 * @returns {Object} - Mock response
 */
export const sendMessageMock = async (messages, onChunk = null) => {
  // Get the last user message
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const userContent = lastUserMessage ? lastUserMessage.content : '';
  
  // Create a helpful mock response
  const mockResponse = {
    role: 'assistant',
    id: `mock-msg-${Date.now()}`,
    content: `I'm currently operating in offline mode due to a backend connection issue. Here's what I would typically do with your request: "${userContent}"\n\nTo fix this issue:\n\n1. Make sure the backend server is running at ${BACKEND_URL}\n2. Check that you're logged in to the app\n3. Verify your network connection\n\nIf the problem persists, please contact support.`
  };
  
  // If streaming is requested, simulate streaming
  if (onChunk) {
    const content = mockResponse.content;
    let streamedContent = '';
    
    // Function to stream content in chunks
    const streamContentInChunks = async (position = 0) => {
      // Calculate a natural chunk size (larger chunks for faster perceived streaming)
      const chunkSize = Math.floor(Math.random() * 5) + 5; // 5-9 chars per update
      const nextPosition = Math.min(position + chunkSize, content.length);
      
      if (position < content.length) {
        // Add next chunk to streamed content
        streamedContent = content.substring(0, nextPosition);
        
        // Send the update
        onChunk({
          ...mockResponse,
          content: streamedContent
        });
        
        // Continue streaming after a small delay
        setTimeout(() => streamContentInChunks(nextPosition), 10);
      }
    };
    
    // Start streaming content
    streamContentInChunks();
  }
  
  return mockResponse;
};