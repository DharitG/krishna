import { sendMessage, sendMessageMock, authenticateService } from './api';
import * as chatService from './chatService';
import Constants from 'expo-constants';
import { useAuth } from './authContext';
import supabase from './supabase'; // Import supabase instance

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

console.log('Azure configuration status:', { 
  isConfigured: isAzureConfigured,
  hasApiKey: !!AZURE_OPENAI_API_KEY,
  hasEndpoint: !!AZURE_OPENAI_ENDPOINT,
  hasDeploymentName: !!AZURE_OPENAI_DEPLOYMENT_NAME
});

console.log('Composio configuration status:', {
  isConfigured: isComposioConfigured,
  hasApiKey: !!COMPOSIO_API_KEY
});

// Chat store for managing chat sessions with persistent storage
class ChatStore {
  constructor() {
    this.chats = [];
    this.activeChat = null;
    this.isLoaded = false;
    this.authStatus = {}; // Service authentication status
  }

  // Initialize the store with data from Supabase
  async initialize() {
    if (this.isLoaded) return;
    
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('User not authenticated, falling back to mock data');
        this._initializeMockData();
        return true;
      }
      
      // Load chats from the database
      const chats = await chatService.getChats();
      
      if (chats.length === 0) {
        // Create a default chat if no chats exist
        const newChat = await chatService.createChat('New Chat');
        
        // Add welcome message
        await chatService.addMessage(
          newChat.id, 
          'assistant', 
          `Hello! I'm August, your AI super agent with tool capabilities. How can I help you today?`
        );
        
        this.chats = [
          {
            ...newChat,
            messages: [
              {
                role: 'assistant',
                content: `Hello! I'm August, your AI super agent with tool capabilities. How can I help you today?`
              }
            ],
            enabledTools: [], 
            useTools: true
          }
        ];
      } else {
        // Load first chat with its messages
        const firstChat = await chatService.getChatById(chats[0].id);
        
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
        messages: [
          {
            role: 'assistant',
            content: "Hello! I'm August, your AI super agent with tool capabilities. How can I help you today?"
          }
        ],
        created_at: new Date(),
        updated_at: new Date(),
        enabledTools: [], // Tools enabled for this chat
        useTools: true // Whether to use tools or not
      },
      {
        id: 'mock-chat-2',
        title: 'Weather forecast',
        messages: [
          {
            role: 'assistant',
            content: "Hello! I'm August, your AI super agent. How can I help you today?"
          },
          {
            role: 'user',
            content: "What's the weather forecast for this weekend?"
          },
          {
            role: 'assistant',
            content: "I don't have real-time weather data, but I can help you check the forecast using a weather service. Would you like me to guide you through checking the weather for your location this weekend?"
          }
        ],
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
    return [...this.chats].sort((a, b) => 
      new Date(b.updated_at) - new Date(a.updated_at)
    );
  }
  
  // Search across all chats
  async searchMessages(query) {
    if (!this.isLoaded) await this.initialize();
    
    if (!query || query.trim() === '') {
      return [];
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    const results = [];
    
    // First, we need to ensure all chats have their messages loaded
    for (const chat of this.chats) {
      if (!chat.messages || chat.messages.length === 0) {
        const fullChat = await chatService.getChatById(chat.id);
        chat.messages = fullChat.messages || [];
      }
      
      chat.messages.forEach((message, messageIndex) => {
        if (message.content.toLowerCase().includes(normalizedQuery)) {
          results.push({
            chatId: chat.id,
            messageIndex,
            message,
            chatTitle: chat.title,
          });
        }
      });
    }
    
    return results;
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
      // This is the critical fix for the iterator error
      try {
        // If it's an object with iterator properties but not an array
        if (typeof chat.messages === 'object' && chat.messages !== null) {
          // Try to convert to array if possible
          chat.messages = Array.from(chat.messages);
        } else {
          // Otherwise, reset to empty array
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
        const fullChat = await chatService.getChatById(chat.id);
        // Ensure messages from service is an array
        chat.messages = Array.isArray(fullChat.messages) ? fullChat.messages : [];
      } catch (error) {
        console.error('Error loading messages for active chat:', error.message);
        // Keep messages as empty array if there's an error
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
        const fullChat = await chatService.getChatById(chat.id);
        chat.messages = fullChat.messages || [];
      } catch (error) {
        console.error('Error loading messages for chat:', error.message);
      }
    }
    
    return this.getActiveChat();
  }

  // Create a new chat
  async createChat(useTools = true) {
    if (!this.isLoaded) await this.initialize();
    
    try {
      // Create chat in database
      const newChat = await chatService.createChat('New Chat');
      
      // Add welcome message
      await chatService.addMessage(
        newChat.id, 
        'assistant', 
        `Hello! I'm August, your AI super agent${useTools ? ' with tool capabilities' : ''}. How can I help you today?`
      );
      
      // Add to local state
      const chatWithMessages = {
        ...newChat,
        messages: [
          {
            role: 'assistant',
            content: `Hello! I'm August, your AI super agent${useTools ? ' with tool capabilities' : ''}. How can I help you today?`
          }
        ],
        enabledTools: [],
        useTools: useTools
      };
      
      this.chats.unshift(chatWithMessages);
      this.activeChat = newChat.id;
      
      return chatWithMessages;
    } catch (error) {
      console.error('Error creating chat:', error.message);
      
      // Fallback to local-only chat if database operation fails
      const newChatId = `mock-chat-${Date.now().toString().slice(-6)}`;
      const newChat = {
        id: newChatId,
        title: 'New Chat',
        messages: [
          {
            role: 'assistant',
            content: `Hello! I'm August, your AI super agent${useTools ? ' with tool capabilities' : ''}. How can I help you today?`
          }
        ],
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
      await chatService.deleteChat(chatId);
      
      // Remove from local state
      this.chats = this.chats.filter(chat => chat.id !== chatId);
      
      // If we deleted the active chat, set active to the first remaining chat
      if (this.activeChat === chatId && this.chats.length > 0) {
        this.activeChat = this.chats[0].id;
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

  // Authenticate with a third-party service for tools
  async authenticateService(serviceName) {
    if (!isComposioConfigured) {
      return {
        error: true,
        message: 'Composio is not configured. Please set up your COMPOSIO_API_KEY.'
      };
    }
    
    try {
      return await authenticateService(serviceName);
    } catch (error) {
      console.error(`Error authenticating with ${serviceName}:`, error);
      return {
        error: true,
        message: `Failed to authenticate with ${serviceName}: ${error.message}`
      };
    }
  }

  // Send a message in the active chat
  async sendMessage(content) {
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
      
      if (isAzureConfigured) {
        // Send message to chatService which will persist to database
        const response = await chatService.sendMessageAndGetResponse(
          chat.id,
          content,
          chat.enabledTools.length > 0 ? chat.enabledTools : undefined,
          canUseTools,
          this.authStatus
        );
        
        // Add assistant response to local state
        chat.messages.push(response);
        
        // Update chat title if this is the first user message
        if (chat.messages.filter(m => m.role === 'user').length === 1) {
          // Use the first 20 chars of user's first message as the chat title
          const newTitle = content.substring(0, 20) + (content.length > 20 ? '...' : '');
          
          // Update in database
          await chatService.updateChatTitle(chat.id, newTitle);
          
          // Update local state
          chat.title = newTitle;
        }
        
        return response;
      } else {
        // Fallback to mock data if Azure is not configured
        const mockResponse = await sendMessageMock(chat.messages);
        
        // Update local state
        chat.messages.push(mockResponse);
        
        // Add to database if possible
        try {
          await chatService.addMessage(chat.id, 'user', content);
          await chatService.addMessage(chat.id, 'assistant', mockResponse.content);
        } catch (error) {
          console.error('Error saving mock messages to database:', error.message);
        }
        
        return mockResponse;
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
        await chatService.addMessage(chat.id, 'assistant', errorMessage.content);
      } catch (dbError) {
        console.error('Error saving error message to database:', dbError.message);
      }
      
      return errorMessage;
    }
  }
  
  // Update authentication status for a service
  updateAuthStatus(service, isAuthenticated) {
    this.authStatus[service] = isAuthenticated;
    console.log(`Updated auth status for ${service} to ${isAuthenticated}`);
    console.log('Current auth status:', this.authStatus);
    return true;
  }
}

// Export a singleton instance
export default new ChatStore();