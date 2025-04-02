import axios from 'axios';
import Constants from 'expo-constants';
import composioService from './composio';
import * as SecureStore from 'expo-secure-store';
import supabase from './supabase'; // Correct import for the default export
import socketService from './socket';

// Get configuration from environment
const {
  FEATURE_AZURE_OPENAI = true,
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
  timeout: 30000, // 30 seconds
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
const DEFAULT_ENABLED_TOOLS = [];

/**
 * Get the authentication token from Supabase or SecureStore
 * @returns {Promise<string|null>} - The authentication token or null if not available
 */
export const getAuthToken = async () => {
  try {
    // First try to get the session from Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (data && data.session && data.session.access_token) {
      return data.session.access_token;
    } else {
      // Fallback to SecureStore if Supabase session isn't available
      const token = await SecureStore.getItemAsync('auth_token');
      return token || null;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Custom implementation of EventSource for React Native
 * @param {String} url - The URL to connect to
 * @param {Object} options - Options for the connection
 * @returns {Object} - The EventSource-like object
 */
const createEventSource = (url, options = {}) => {
  let abortController = new AbortController();
  let buffer = '';
  let retryCount = 0;
  const maxRetries = 3;
  
  const eventSource = {
    listeners: {},
    readyState: 0, // 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
    
    addEventListener: function(type, listener) {
      if (!this.listeners[type]) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(listener);
    },
    
    removeEventListener: function(type, listener) {
      if (!this.listeners[type]) return;
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    },
    
    dispatchEvent: function(event) {
      if (!this.listeners[event.type]) return;
      this.listeners[event.type].forEach(listener => listener(event));
    },
    
    close: function() {
      if (this.readyState === 2) return;
      this.readyState = 2;
      abortController.abort();
      this.dispatchEvent({ type: 'close' });
    }
  };
  
  const connect = async () => {
    try {
      eventSource.readyState = 0;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: abortController.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      eventSource.readyState = 1;
      eventSource.dispatchEvent({ type: 'open' });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              eventSource.close();
              break;
            }
            
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete lines
            let lines = buffer.split('\n');
            buffer = lines.pop(); // Keep the last incomplete line in the buffer
            
            for (const line of lines) {
              if (!line.trim()) continue;
              
              if (line.startsWith('data: ')) {
                const data = line.substring(6);
                eventSource.dispatchEvent({ 
                  type: 'message',
                  data
                });
              }
            }
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Error reading stream:', error);
            
            // Attempt to reconnect if not manually closed
            if (eventSource.readyState !== 2 && retryCount < maxRetries) {
              retryCount++;
              setTimeout(connect, 1000 * retryCount);
            } else {
              eventSource.close();
            }
          }
        }
      };
      
      processStream();
    } catch (error) {
      console.error('Error connecting to stream:', error);
      
      // Attempt to reconnect if not manually closed
      if (eventSource.readyState !== 2 && retryCount < maxRetries) {
        retryCount++;
        setTimeout(connect, 1000 * retryCount);
      } else {
        eventSource.close();
        eventSource.dispatchEvent({ 
          type: 'error',
          error
        });
      }
    }
  };
  
  connect();
  return eventSource;
};

/**
 * Send a message to the backend API (with streaming support via WebSockets)
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
    
    // If streaming is requested, use WebSockets
    if (onChunk) {
      try {
        console.log('Using WebSockets for streaming chat');
        
        // Join the chat room if we have a chat ID
        if (chatId) {
          await socketService.joinChatRoom(chatId);
        }
        
        // Create a handler for message chunks
        const handleChunk = (data) => {
          if (data.content && onChunk) {
            onChunk({
              role: 'assistant',
              content: data.content,
              id: data.id || `msg-${Date.now()}`
            });
          }
        };
        
        // Create a handler for the complete message
        const handleComplete = (data) => {
          console.log('Message streaming complete');
        };
        
        // Send the message via WebSocket
        const result = await socketService.sendMessageViaSocket(
          messages,
          enabledTools,
          useTools,
          chatId,
          handleChunk,
          handleComplete
        );
        
        return result;
      } catch (error) {
        console.error('Error in WebSocket streaming:', error);
        console.error('Falling back to HTTP request');
        
        // Fall back to non-streaming request
        return sendMessageFallback(messages, enabledTools, useTools, authStatus);
      }
    } else {
      // For non-streaming requests, use regular HTTP
      return sendMessageFallback(messages, enabledTools, useTools, authStatus);
    }
  } catch (error) {
    console.error('Error sending message and getting response:', error.message);
    
    // Fall back to the mock response
    return sendMessageMock(messages, onChunk);
  }
};

/**
 * Fallback method to send a message via HTTP (no streaming)
 */
const sendMessageFallback = async (messages, enabledTools, useTools, authStatus) => {
  // Determine which endpoint to use based on whether tools are enabled and if we have a chat ID
  const chatId = messages[0]?.chatId;
  let endpoint;
  
  if (chatId) {
    // If we have a chat ID, use the chat-specific endpoint
    endpoint = `/api/chats/${chatId}/messages`;
  } else {
    // Otherwise use the Composio endpoint
    endpoint = '/api/composio/execute';
  }
  
  // Make the request
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
};

/**
 * Authenticate with a third-party service via backend
 * @param {String} serviceName - Name of the service to authenticate with
 * @returns {Object} - Authentication information
 */
export const authenticateService = async (serviceName) => {
  console.log(`Authenticating service: ${serviceName}`);
  try {
    // Get the auth token
    const token = await getAuthToken();
    console.log(`Got auth token: ${token ? 'Yes' : 'No'}`);
    
    // Fix: Use the correct endpoint path that matches the backend route
    console.log(`Making request to: /api/composio/auth/init/${serviceName}`);
    const response = await api.post(`/api/composio/auth/init/${serviceName}`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    console.log(`Authentication response:`, response.data);
    
    // If in mock mode, show a warning to the user
    if (response.data.mockMode) {
      console.warn('Using mock mode for authentication because Composio API is unreachable');
    }
    
    // If the service is already authenticated, return success without redirect
    if (response.data.isAuthenticated === true) {
      console.log(`Service ${serviceName} is already authenticated`);
      return {
        isAuthenticated: true,
        success: true,
        message: `${serviceName} is already connected`
      };
    }
    
    // Check if redirectUrl exists in the response
    if (!response.data.redirectUrl) {
      console.error(`No redirect URL for ${serviceName}:`, response.data);
      throw new Error(`No redirect URL provided in the server response for ${serviceName}`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error authenticating with ${serviceName}:`, error);
    
    // Provide more detailed error message
    let errorMessage = `Error authenticating with ${serviceName}`;
    
    if (error.response && error.response.data) {
      errorMessage = error.response.data.error || errorMessage;
      
      // If it's a configuration error, provide more guidance
      if (error.response.data.configError) {
        errorMessage += '. Please check your backend configuration.';
      }
      
      // If it's a Composio error, provide guidance about Composio setup
      if (error.response.data.composioError) {
        errorMessage += '. Please ensure Gmail is properly configured in the Composio dashboard.';
      }
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Check authentication status for a tool
 * @param {String} toolName - Name of the tool to check
 * @returns {Object} - Authentication status and redirect URL if needed
 */
export const checkToolAuth = async (toolName) => {
  try {
    // Change this line to match the backend route
    const response = await api.post('/api/composio/tools/check-auth', { toolName });
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