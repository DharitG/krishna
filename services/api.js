import axios from 'axios';
import Constants from 'expo-constants';

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

export const sendMessage = async (messages) => {
  try {
    // Log environment variables (sanitized) for debugging
    console.log('Azure OpenAI Configuration:', {
      endpoint: AZURE_OPENAI_ENDPOINT ? AZURE_OPENAI_ENDPOINT.substring(0, 15) + '...' : 'not set',
      deploymentName: AZURE_OPENAI_DEPLOYMENT_NAME || 'not set',
      apiVersion: API_VERSION,
      hasApiKey: !!AZURE_OPENAI_API_KEY
    });

    // Ensure the endpoint has no trailing slash before adding the path
    const normalizedEndpoint = AZURE_OPENAI_ENDPOINT.endsWith('/') 
      ? AZURE_OPENAI_ENDPOINT.slice(0, -1) 
      : AZURE_OPENAI_ENDPOINT;
    
    // Standard Azure OpenAI API URL format
    const azureApiUrl = `${normalizedEndpoint}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;
    
    // Log full URL for debugging (with API key redacted)
    console.log('Full Azure API URL:', azureApiUrl);
    console.log('Request URL:', azureApiUrl);
    
    // Log the request payload (excluding message content for privacy)
    console.log('Request params:', {
      messageCount: messages.length,
      temperature,
      max_tokens: maxTokens,
      top_p: 0.95
    });
    
    const response = await api.post(azureApiUrl, {
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: null
    });
    
    console.log('Response status:', response.status);
    console.log('Response has data:', !!response.data);
    
    return response.data.choices[0].message;
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