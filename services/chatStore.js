import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { 
  getChats, 
  getChatById, 
  createChat, 
  updateChatTitle, 
  deleteChat, 
  sendMessageAndGetResponse,
  addMessage
} from './chatService';
import { authenticateService, checkToolAuth } from './api';
import Constants from 'expo-constants';
import supabase from './supabase';

// Get environment variables
const { 
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_DEPLOYMENT_NAME,
  COMPOSIO_API_KEY
} = Constants.expoConfig?.extra || {};

// Check if all required Azure config is present
const isAzureConfigured = !!(
  AZURE_OPENAI_API_KEY && 
  AZURE_OPENAI_ENDPOINT && 
  AZURE_OPENAI_DEPLOYMENT_NAME
);

// Check if Composio is configured
const isComposioConfigured = !!COMPOSIO_API_KEY;

// Create a store for chat state
const useZustandChatStore = create((set, get) => ({
  // Chat list state
  chats: [],
  isLoadingChats: false,
  chatError: null,
  
  // Current chat state
  currentChat: null,
  currentChatId: null,
  isLoadingCurrentChat: false,
  currentChatError: null,
  
  // Message sending state
  isSendingMessage: false,
  sendMessageError: null,
  
  // Authentication state for services
  authStatus: {},
  
  // Streaming state
  streamingMessage: null,
  
  // Initialization flag
  isInitialized: false,
  
  // Additional states to fully replace ChatStore capabilities
  activeChat: null,
  
  // Initialize the store
  initialize: async () => {
    if (get().isInitialized) return;
    
    try {
      // Load chats from the database
      const chats = await getChats();
      
      // Load authentication status from SecureStore
      const authStatusJson = await SecureStore.getItemAsync('auth_status');
      const authStatus = authStatusJson ? JSON.parse(authStatusJson) : {};
      
      // Set initial state
      set({ 
        chats, 
        authStatus,
        isInitialized: true,
        activeChat: chats.length > 0 ? chats[0].id : null,
        currentChatId: chats.length > 0 ? chats[0].id : null,
        currentChat: chats.length > 0 ? chats[0] : null
      });
      
      return true;
    } catch (error) {
      console.error('Error initializing chat store:', error);
      set({ isInitialized: false });
      return false;
    }
  },
  
  // Load all chats
  loadChats: async () => {
    set({ isLoadingChats: true, chatError: null });
    
    try {
      const chats = await getChats();
      set({ chats, isLoadingChats: false });
      
      // Sort chats by updated_at date
      const sortedChats = [...chats].sort((a, b) => 
        new Date(b.updated_at) - new Date(a.updated_at)
      );
      
      return sortedChats;
    } catch (error) {
      console.error('Error loading chats:', error);
      set({ chatError: error.message, isLoadingChats: false });
      return [];
    }
  },
  
  // Load a specific chat by ID
  loadChat: async (chatId) => {
    set({ 
      isLoadingCurrentChat: true, 
      currentChatError: null,
      currentChatId: chatId,
      activeChat: chatId
    });
    
    try {
      const chat = await getChatById(chatId);
      
      // Ensure messages is always an array
      if (!chat.messages) {
        chat.messages = [];
      } else if (!Array.isArray(chat.messages)) {
        try {
          if (typeof chat.messages === 'object' && chat.messages !== null) {
            chat.messages = Array.from(chat.messages);
          } else {
            chat.messages = [];
          }
        } catch (error) {
          console.error('Error converting messages to array:', error);
          chat.messages = [];
        }
      }
      
      set({ currentChat: chat, isLoadingCurrentChat: false });
      return chat;
    } catch (error) {
      console.error('Error loading chat:', error);
      set({ 
        currentChatError: error.message, 
        isLoadingCurrentChat: false 
      });
      return null;
    }
  },
  
  // Create a new chat
  createNewChat: async (title = 'New Chat', useTools = true) => {
    if (!get().isInitialized) await get().initialize();
    set({ isLoadingChats: true, chatError: null });
    
    try {
      const newChat = await createChat(title);
      
      // Add tools configuration
      const chatWithTools = {
        ...newChat,
        messages: [],
        enabledTools: [],
        useTools: useTools
      };
      
      set(state => ({ 
        chats: [chatWithTools, ...state.chats],
        currentChat: chatWithTools,
        currentChatId: chatWithTools.id,
        activeChat: chatWithTools.id,
        isLoadingChats: false 
      }));
      
      return chatWithTools;
    } catch (error) {
      console.error('Error creating chat:', error);
      
      // Fallback to local-only chat if database operation fails
      const newChatId = `mock-chat-${Date.now().toString().slice(-6)}`;
      const fallbackChat = {
        id: newChatId,
        title: 'New Chat',
        messages: [],
        created_at: new Date(),
        updated_at: new Date(),
        enabledTools: [],
        useTools: useTools
      };
      
      set(state => ({
        chats: [fallbackChat, ...state.chats],
        currentChat: fallbackChat,
        currentChatId: fallbackChat.id,
        activeChat: fallbackChat.id,
        isLoadingChats: false,
        chatError: error.message
      }));
      
      return fallbackChat;
    }
  },
  
  // Update a chat's title
  updateChatTitle: async (chatId, title) => {
    try {
      const updatedChat = await updateChatTitle(chatId, title);
      
      set(state => ({ 
        chats: state.chats.map(chat => 
          chat.id === chatId ? { ...chat, title } : chat
        ),
        currentChat: state.currentChat?.id === chatId 
          ? { ...state.currentChat, title } 
          : state.currentChat
      }));
      
      return updatedChat;
    } catch (error) {
      console.error('Error updating chat title:', error);
      return null;
    }
  },
  
  // Delete a chat
  deleteChat: async (chatId) => {
    if (!get().isInitialized) await get().initialize();
    
    try {
      // Delete from database
      await deleteChat(chatId);
      
      set(state => {
        const filteredChats = state.chats.filter(chat => chat.id !== chatId);
        const newActiveChat = state.activeChat === chatId && filteredChats.length > 0 
          ? filteredChats[0].id 
          : state.activeChat === chatId ? null : state.activeChat;
          
        return { 
          chats: filteredChats,
          currentChat: state.currentChat?.id === chatId ? 
            (filteredChats.length > 0 ? filteredChats[0] : null) : 
            state.currentChat,
          currentChatId: state.currentChatId === chatId ? 
            (filteredChats.length > 0 ? filteredChats[0].id : null) : 
            state.currentChatId,
          activeChat: newActiveChat
        };
      });
      
      // If we have a new active chat, load it
      const { activeChat } = get();
      if (activeChat) {
        await get().loadChat(activeChat);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      
      // Fallback to local-only deletion if database operation fails
      set(state => {
        const filteredChats = state.chats.filter(chat => chat.id !== chatId);
        const newActiveChat = state.activeChat === chatId && filteredChats.length > 0 
          ? filteredChats[0].id 
          : state.activeChat === chatId ? null : state.activeChat;
          
        return { 
          chats: filteredChats,
          currentChat: state.currentChat?.id === chatId ? 
            (filteredChats.length > 0 ? filteredChats[0] : null) : 
            state.currentChat,
          currentChatId: state.currentChatId === chatId ? 
            (filteredChats.length > 0 ? filteredChats[0].id : null) : 
            state.currentChatId,
          activeChat: newActiveChat
        };
      });
      
      return false;
    }
  },
  
  // Toggle tool usage for a chat
  toggleToolsForChat: (chatId, useTools) => {
    set(state => ({
      chats: state.chats.map(chat => 
        chat.id === chatId ? { ...chat, useTools } : chat
      ),
      currentChat: state.currentChat?.id === chatId 
        ? { ...state.currentChat, useTools } 
        : state.currentChat
    }));
    
    return true;
  },
  
  // Update enabled tools for a chat
  updateEnabledTools: (chatId, enabledTools) => {
    set(state => ({
      chats: state.chats.map(chat => 
        chat.id === chatId ? { ...chat, enabledTools } : chat
      ),
      currentChat: state.currentChat?.id === chatId 
        ? { ...state.currentChat, enabledTools } 
        : state.currentChat
    }));
    
    return true;
  },
  
  // Set active chat
  setActiveChat: async (chatId) => {
    if (!get().isInitialized) await get().initialize();
    
    set({ activeChat: chatId });
    
    // Load the chat from the database
    return await get().loadChat(chatId);
  },
  
  // Get active chat
  getActiveChat: async () => {
    if (!get().isInitialized) await get().initialize();
    
    const { activeChat, chats } = get();
    
    // Find the chat in the local state
    const chat = chats.find(c => c.id === activeChat);
    
    // If no chat found, return the first chat or a default empty chat
    if (!chat) {
      if (chats.length > 0) {
        const firstChat = chats[0];
        set({ activeChat: firstChat.id });
        return firstChat;
      } else {
        return {
          id: 'empty-chat',
          title: 'New Chat',
          messages: [],
          created_at: new Date(),
          updated_at: new Date(),
          enabledTools: [],
          useTools: true
        };
      }
    }
    
    // Load the chat if we need more data
    if (!chat.messages || chat.messages.length === 0) {
      return await get().loadChat(chat.id);
    }
    
    return chat;
  },
  
  // Send a message and get a response
  sendMessage: async (message, onStreamUpdate = null) => {
    if (!get().isInitialized) await get().initialize();
    
    const { activeChat, chats, authStatus } = get();
    
    if (!activeChat) {
      console.error('No active chat selected');
      return null;
    }
    
    const chat = chats.find(c => c.id === activeChat);
    
    if (!chat) {
      console.error('Active chat not found:', activeChat);
      return null;
    }
    
    const enabledTools = chat.enabledTools || [];
    const useTools = chat.useTools !== undefined ? chat.useTools : true;
    
    set({ 
      isSendingMessage: true, 
      sendMessageError: null,
      streamingMessage: null
    });
    
    try {
      // Handle streaming updates
      const handleStreamUpdate = (chunk) => {
        set({ streamingMessage: chunk });
        
        // Pass to callback if provided
        if (onStreamUpdate) {
          onStreamUpdate(chunk);
        }
      };
      
      // Send the message and get the response
      const response = await sendMessageAndGetResponse(
        activeChat, 
        message, 
        enabledTools, 
        useTools,
        authStatus,
        handleStreamUpdate
      );
      
      // Reset streaming state
      set({ streamingMessage: null });
      
      // Reload the current chat to get the updated messages
      await get().loadChat(activeChat);
      
      set({ isSendingMessage: false });
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      set({ 
        sendMessageError: error.message, 
        isSendingMessage: false,
        streamingMessage: null
      });
      return null;
    }
  },
  
  // Authenticate with a service
  authenticateService: async (serviceName) => {
    try {
      // Check if already authenticated
      const isAuthenticated = get().authStatus[serviceName];
      
      if (isAuthenticated) {
        return { isAuthenticated: true };
      }
      
      // Get authentication URL from backend
      const authResult = await authenticateService(serviceName);
      
      if (authResult.redirectUrl) {
        return authResult;
      } else {
        throw new Error('No redirect URL provided');
      }
    } catch (error) {
      console.error(`Error authenticating with ${serviceName}:`, error);
      return { error: true, message: error.message };
    }
  },
  
  // Check authentication for a tool
  checkToolAuth: async (toolName) => {
    try {
      const result = await checkToolAuth(toolName);
      return result;
    } catch (error) {
      console.error(`Error checking auth for ${toolName}:`, error);
      return { error: true, message: error.message };
    }
  },
  
  // Update authentication status
  updateAuthStatus: (serviceName, isAuthenticated) => {
    set(state => {
      const newAuthStatus = {
        ...state.authStatus,
        [serviceName]: isAuthenticated
      };
      
      // Save to SecureStore
      SecureStore.setItemAsync('auth_status', JSON.stringify(newAuthStatus))
        .catch(err => console.error('Error saving auth status:', err));
      
      return { authStatus: newAuthStatus };
    });
  }
}));

// Export the hook
export default useZustandChatStore;
