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
  
  // Load all chats
  loadChats: async () => {
    set({ isLoadingChats: true, chatError: null });
    
    try {
      const chats = await getChats();
      set({ chats, isLoadingChats: false });
      return chats;
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
      currentChatId: chatId
    });
    
    try {
      const chat = await getChatById(chatId);
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
  createNewChat: async (title = 'New Chat') => {
    set({ isLoadingChats: true, chatError: null });
    
    try {
      const newChat = await createChat(title);
      set(state => ({ 
        chats: [newChat, ...state.chats],
        currentChat: newChat,
        currentChatId: newChat.id,
        isLoadingChats: false 
      }));
      
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      set({ chatError: error.message, isLoadingChats: false });
      return null;
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
    try {
      await deleteChat(chatId);
      
      set(state => ({ 
        chats: state.chats.filter(chat => chat.id !== chatId),
        currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
        currentChatId: state.currentChatId === chatId ? null : state.currentChatId
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  },
  
  // Send a message and get a response
  sendMessage: async (message, enabledTools = [], useTools = true, onStreamUpdate = null) => {
    const { currentChatId, authStatus } = get();
    
    if (!currentChatId) {
      console.error('No current chat selected');
      return null;
    }
    
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
        currentChatId, 
        message, 
        enabledTools, 
        useTools,
        authStatus,
        handleStreamUpdate
      );
      
      // Reset streaming state
      set({ streamingMessage: null });
      
      // Reload the current chat to get the updated messages
      await get().loadChat(currentChatId);
      
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
    set(state => ({
      authStatus: {
        ...state.authStatus,
        [serviceName]: isAuthenticated
      }
    }));
  },
  
  // Load authentication status from secure storage
  loadAuthStatus: async () => {
    try {
      const authStatusString = await SecureStore.getItemAsync('auth_status');
      
      if (authStatusString) {
        const authStatus = JSON.parse(authStatusString);
        set({ authStatus });
      }
    } catch (error) {
      console.error('Error loading auth status:', error);
    }
  },
  
  // Save authentication status to secure storage
  saveAuthStatus: async () => {
    try {
      const { authStatus } = get();
      await SecureStore.setItemAsync('auth_status', JSON.stringify(authStatus));
    } catch (error) {
      console.error('Error saving auth status:', error);
    }
  }
}));

// Wrapper class for backward compatibility with the old ChatStore
class ChatStore {
  constructor() {
    this.isLoaded = false;
    this.activeChat = null;
    this.authStatus = {};
  }
  
  // Initialize the store with data from Supabase
  async initialize() {
    if (this.isLoaded) return true;
    
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('User not authenticated, falling back to mock data');
        this._initializeMockData();
        return true;
      }
      
      // Load chats from the database
      const chats = await getChats();
      
      if (chats.length === 0) {
        // Create a default chat if no chats exist
        const newChat = await createChat('New Chat');
        
        this.chats = [
          {
            ...newChat,
            messages: [],
            enabledTools: [], 
            useTools: true
          }
        ];
      } else {
        // Load first chat with its messages
        const firstChat = await getChatById(chats[0].id);
        
        this.chats = chats.map((chat, index) => {
          if (index === 0) {
            return {
              ...chat,
              messages: firstChat.messages || [],
              enabledTools: [],
              useTools: true
            };
          }
          return {
            ...chat,
            messages: [], // We'll lazy-load messages for other chats
            enabledTools: [],
            useTools: true
          };
        });
      }
      
      this.activeChat = this.chats.length > 0 ? this.chats[0].id : null;
      this.isLoaded = true;
      
      // Update the Zustand store
      const zustandStore = useZustandChatStore.getState();
      zustandStore.loadChats();
      
      if (this.activeChat) {
        zustandStore.loadChat(this.activeChat);
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing chat store:', error.message);
      // Fallback to mock data if initialization fails
      this._initializeMockData();
      return false;
    }
  }
  
  // Fallback to mock data if Supabase is not configured
  _initializeMockData() {
    // Pre-populated chats for demo purposes
    this.chats = [
      {
        id: 'mock-chat-1',
        title: 'New Chat',
        messages: [],
        created_at: new Date(),
        updated_at: new Date(),
        enabledTools: [], // Tools enabled for this chat
        useTools: true // Whether to use tools or not
      },
      {
        id: 'mock-chat-2',
        title: 'Weather forecast',
        messages: [],
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        enabledTools: [],
        useTools: false
      }
    ];
    
    this.activeChat = 'mock-chat-1';
    this.isLoaded = true;
  }
  
  // Get all chats
  async getChats() {
    if (!this.isLoaded) await this.initialize();
    
    // Use the Zustand store to get chats
    const zustandStore = useZustandChatStore.getState();
    const chats = await zustandStore.loadChats();
    
    // Update local reference
    this.chats = chats;
    
    return [...this.chats].sort((a, b) => 
      new Date(b.updated_at) - new Date(a.updated_at)
    );
  }
  
  // Get active chat
  async getActiveChat() {
    if (!this.isLoaded) await this.initialize();
    
    const chat = this.chats.find(chat => chat.id === this.activeChat);
    
    // If no chat found, return the first chat or a default empty chat
    if (!chat) {
      if (this.chats.length > 0) {
        return this.chats[0];
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
    
    // Ensure messages is always an array
    if (!chat.messages) {
      chat.messages = [];
    } else if (!Array.isArray(chat.messages)) {
      // If messages exists but is not an array, convert it to an array
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
    
    // If chat exists but messages aren't loaded, load them
    if (chat.messages.length === 0) {
      try {
        const fullChat = await getChatById(chat.id);
        chat.messages = Array.isArray(fullChat.messages) ? fullChat.messages : [];
      } catch (error) {
        console.error('Error loading messages for active chat:', error.message);
        chat.messages = [];
      }
    }
    
    return chat;
  }
  
  // Set active chat
  async setActiveChat(chatId) {
    if (!this.isLoaded) await this.initialize();
    
    this.activeChat = chatId;
    
    // Find the chat
    const chat = this.chats.find(c => c.id === chatId);
    
    // If chat exists but messages aren't loaded, load them
    if (chat && (!chat.messages || chat.messages.length === 0)) {
      try {
        const fullChat = await getChatById(chat.id);
        chat.messages = fullChat.messages || [];
      } catch (error) {
        console.error('Error loading messages for chat:', error.message);
      }
    }
    
    // Update the Zustand store
    const zustandStore = useZustandChatStore.getState();
    zustandStore.loadChat(chatId);
    
    return this.getActiveChat();
  }
  
  // Create a new chat
  async createChat(useTools = true) {
    if (!this.isLoaded) await this.initialize();
    
    try {
      // Create chat in database
      const newChat = await createChat('New Chat');
      
      // Add to local state
      const chatWithMessages = {
        ...newChat,
        messages: [],
        enabledTools: [],
        useTools: useTools
      };
      
      this.chats.unshift(chatWithMessages);
      this.activeChat = newChat.id;
      
      // Update the Zustand store
      const zustandStore = useZustandChatStore.getState();
      zustandStore.loadChats();
      zustandStore.loadChat(newChat.id);
      
      return chatWithMessages;
    } catch (error) {
      console.error('Error creating chat:', error.message);
      
      // Fallback to local-only chat if database operation fails
      const newChatId = `mock-chat-${Date.now().toString().slice(-6)}`;
      const newChat = {
        id: newChatId,
        title: 'New Chat',
        messages: [],
        created_at: new Date(),
        updated_at: new Date(),
        enabledTools: [],
        useTools: useTools
      };
      
      this.chats.unshift(newChat);
      this.activeChat = newChatId;
      
      return newChat;
    }
  }
  
  // Delete a chat
  async deleteChat(chatId) {
    if (!this.isLoaded) await this.initialize();
    
    try {
      // Delete from database
      await deleteChat(chatId);
      
      // Remove from local state
      this.chats = this.chats.filter(chat => chat.id !== chatId);
      
      // If we deleted the active chat, set active to the first remaining chat
      if (this.activeChat === chatId && this.chats.length > 0) {
        this.activeChat = this.chats[0].id;
      }
      
      // Update the Zustand store
      const zustandStore = useZustandChatStore.getState();
      zustandStore.loadChats();
      
      if (this.activeChat) {
        zustandStore.loadChat(this.activeChat);
      }
      
      return this.getChats();
    } catch (error) {
      console.error('Error deleting chat:', error.message);
      
      // Fallback to local-only deletion if database operation fails
      this.chats = this.chats.filter(chat => chat.id !== chatId);
      
      if (this.activeChat === chatId && this.chats.length > 0) {
        this.activeChat = this.chats[0].id;
      }
      
      return this.getChats();
    }
  }
  
  // Toggle tool usage for a chat
  toggleToolsForChat(chatId, useTools) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.useTools = useTools;
      return true;
    }
    return false;
  }
  
  // Update enabled tools for a chat
  updateEnabledTools(chatId, enabledTools) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.enabledTools = enabledTools;
      return true;
    }
    return false;
  }
  
  // Send a message in the active chat with streaming support
  async sendMessage(content, onStreamUpdate = null) {
    if (!this.isLoaded) await this.initialize();
    
    const chat = await this.getActiveChat();
    if (!chat) return null;
    
    try {
      // Ensure chat.messages is always an array
      if (!Array.isArray(chat.messages)) {
        chat.messages = [];
      }
      
      // Add local user message for immediate UI feedback
      chat.messages.push({ role: 'user', content });
      
      // Only use tools if both Azure and Composio are configured
      const canUseTools = isComposioConfigured && chat.useTools;
      
      try {
        // Get the Zustand store
        const zustandStore = useZustandChatStore.getState();
        
        // Send the message using the Zustand store
        const response = await zustandStore.sendMessage(
          content, 
          chat.enabledTools || [], 
          canUseTools,
          onStreamUpdate
        );
        
        // Update chat title if this is the first user message
        if (chat.messages.filter(m => m.role === 'user').length === 1) {
          // Use the first 20 chars of user's first message as the chat title
          const newTitle = content.substring(0, 20) + (content.length > 20 ? '...' : '');
          
          // Update in database
          await updateChatTitle(chat.id, newTitle);
          
          // Update local state
          chat.title = newTitle;
        }
        
        return response;
      } catch (backendError) {
        console.error('Error connecting to backend:', backendError);
        console.log('Falling back to mock response');
        
        // Create a mock assistant response
        const assistantMessage = {
          id: `mock-msg-${Date.now()}`,
          role: 'assistant',
          content: `I'm currently operating in offline mode due to a backend connection issue. Here's what I would typically do with your request: "${content}"\n\nPlease check your backend connection and try again later.`,
          created_at: new Date()
        };
        
        // Add to local state
        chat.messages.push(assistantMessage);
        
        // Call stream update if provided
        if (onStreamUpdate) {
          onStreamUpdate(assistantMessage);
        }
        
        return assistantMessage;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to local state
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.'
      };
      
      chat.messages.push(errorMessage);
      
      // Try to save error message to database
      try {
        await addMessage(chat.id, 'assistant', errorMessage.content);
      } catch (dbError) {
        console.error('Error saving error message to database:', dbError.message);
      }
      
      return errorMessage;
    }
  }
  
  // Update authentication status for a service
  updateAuthStatus(service, isAuthenticated) {
    this.authStatus[service] = isAuthenticated;
    
    // Update the Zustand store
    useZustandChatStore.getState().updateAuthStatus(service, isAuthenticated);
    
    console.log(`Updated auth status for ${service} to ${isAuthenticated}`);
    return true;
  }
  
  // Authenticate with a service
  async authenticateService(serviceName) {
    try {
      // Check if already authenticated
      const isAuthenticated = this.authStatus[serviceName];
      
      if (isAuthenticated) {
        return { isAuthenticated: true };
      }
      
      // Use the Zustand store's authenticateService function
      return await authenticateService(serviceName);
    } catch (error) {
      console.error(`Error authenticating with ${serviceName}:`, error);
      return { error: true, message: error.message };
    }
  }
  
  // Check authentication status for a tool
  async checkToolAuth(toolName) {
    try {
      // Use the API function directly
      const result = await checkToolAuth(toolName);
      return result;
    } catch (error) {
      console.error(`Error checking auth for ${toolName}:`, error);
      return { error: true, message: error.message, authenticated: false };
    }
  }
  
  // Retry the last action after authentication
  async retryLastAction() {
    const { currentChat } = useZustandChatStore.getState();
    if (!currentChat) return;

    // Get the last user message
    const lastUserMessage = currentChat.messages
      .filter(m => m.role === 'user')
      .pop();

    if (lastUserMessage) {
      // Retry with the last user message
      await this.sendMessage(lastUserMessage.content);
    }
  }
}

// Export a singleton instance
export default new ChatStore();
