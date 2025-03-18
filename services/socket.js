import { io } from 'socket.io-client';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import supabase from './supabase';

// Get backend URL from environment variables
const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || 'http://localhost:3000';

// Socket.io instance
let socket = null;

/**
 * Get authentication token from Supabase or SecureStore
 * @returns {Promise<string|null>} The authentication token or null if not found
 */
const getAuthToken = async () => {
  try {
    // First try to get token from Supabase session
    const { data } = await supabase.auth.getSession();
    if (data && data.session) {
      return data.session.access_token;
    }
    
    // Fall back to SecureStore
    const token = await SecureStore.getItemAsync('supabase.auth.token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Initialize the WebSocket connection
 * @returns {Object} The socket instance
 */
export const initializeSocket = async () => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    if (!token) {
      console.warn('No authentication token available for WebSocket connection');
      return null;
    }
    
    // Create socket connection with auth token
    socket = io(BACKEND_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    // Set up event listeners
    socket.on('connect', () => {
      console.log('WebSocket connected with ID:', socket.id);
    });
    
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });
    
    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });
    
    return socket;
  } catch (error) {
    console.error('Error initializing WebSocket:', error);
    return null;
  }
};

/**
 * Get the current socket instance or initialize a new one
 * @returns {Object} The socket instance
 */
export const getSocket = async () => {
  if (!socket || !socket.connected) {
    return await initializeSocket();
  }
  return socket;
};

/**
 * Join a chat room
 * @param {string} chatId - The chat ID to join
 */
export const joinChatRoom = async (chatId) => {
  const socket = await getSocket();
  if (socket) {
    socket.emit('join_chat', chatId);
  }
};

/**
 * Leave a chat room
 * @param {string} chatId - The chat ID to leave
 */
export const leaveChatRoom = async (chatId) => {
  const socket = await getSocket();
  if (socket) {
    socket.emit('leave_chat', chatId);
  }
};

/**
 * Send a message via WebSocket
 * @param {Array} messages - Chat messages array
 * @param {Array} enabledTools - Array of tool names to enable (optional)
 * @param {Boolean} useTools - Whether to use tools or not
 * @param {String} chatId - The chat ID
 * @param {Function} onChunk - Callback for each chunk of the response
 * @param {Function} onComplete - Callback for when the message is complete
 * @returns {Promise} A promise that resolves when the message is sent
 */
export const sendMessageViaSocket = async (
  messages,
  enabledTools = [],
  useTools = true,
  chatId = null,
  onChunk = null,
  onComplete = null
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const socket = await getSocket();
      
      if (!socket) {
        reject(new Error('WebSocket not connected'));
        return;
      }
      
      // Set up event listeners for this message
      if (onChunk) {
        socket.on('message_chunk', (data) => {
          onChunk(data);
        });
      }
      
      if (onComplete) {
        socket.on('message_complete', (data) => {
          onComplete(data);
          resolve(data);
          
          // Clean up listeners
          socket.off('message_chunk');
          socket.off('message_complete');
          socket.off('error');
        });
      }
      
      // Set up error handler
      socket.on('error', (error) => {
        console.error('Error sending message via WebSocket:', error);
        reject(error);
        
        // Clean up listeners
        socket.off('message_chunk');
        socket.off('message_complete');
        socket.off('error');
      });
      
      // Set up auth required handler
      socket.on('auth_required', (data) => {
        console.log('Authentication required for service:', data.service);
        // You can handle auth redirects here
      });
      
      // Log what we're sending
      console.log('Sending message via WebSocket:', {
        messageCount: messages.length,
        toolCount: enabledTools.length,
        useTools: useTools
      });
      
      // Send the message
      socket.emit('send_message', {
        messages,
        enabledTools,
        useTools,
        chatId,
        authStatus: {} // We'll get this from the backend
      });
      
    } catch (error) {
      console.error('Error sending message via WebSocket:', error);
      reject(error);
    }
  });
};

export default {
  initializeSocket,
  getSocket,
  joinChatRoom,
  leaveChatRoom,
  sendMessageViaSocket
};
