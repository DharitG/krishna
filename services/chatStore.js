import { sendMessage, sendMessageMock, authenticateService } from './api';
import Constants from 'expo-constants';

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

// Simple chat store for managing multiple chat sessions
class ChatStore {
  constructor() {
    // Pre-populated chats for demo purposes
    this.chats = [
      {
        id: '1',
        title: 'New Chat',
        messages: [
          {
            role: 'assistant',
            content: "Hello! I'm August, your AI super agent with tool capabilities. How can I help you today?"
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        enabledTools: [], // Tools enabled for this chat
        useTools: true // Whether to use tools or not
      },
      {
        id: '2',
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
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        enabledTools: [],
        useTools: false
      },
      {
        id: '3',
        title: 'Recipe ideas for dinner',
        messages: [
          {
            role: 'assistant',
            content: "Hello! I'm August, your AI super agent. How can I help you today?"
          },
          {
            role: 'user',
            content: "Can you give me some recipe ideas for dinner tonight? I have chicken, vegetables, and pasta."
          },
          {
            role: 'assistant',
            content: "Certainly! With chicken, vegetables, and pasta, you have quite a few delicious options. Here are a few recipe ideas:\n\n1. **Chicken Primavera Pasta**: Sauté sliced chicken breast with mixed vegetables like bell peppers, zucchini, and cherry tomatoes. Toss with cooked pasta and a light sauce of olive oil, garlic, and parmesan cheese.\n\n2. **Chicken Stir-Fry with Noodles**: Cook sliced chicken with your vegetables in a wok with soy sauce, garlic, and ginger. Serve over thin pasta like spaghettini.\n\n3. **One-Pan Chicken Pasta Bake**: Combine chopped chicken, vegetables, and uncooked pasta in a baking dish. Add chicken broth and seasonings, cover with foil, and bake until pasta is tender.\n\nWhich style of dish appeals to you most tonight?"
          }
        ],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        enabledTools: [],
        useTools: false
      }
    ];
    this.activeChat = '1';
    
    // Add a tool-enabled chat example if Composio is configured
    if (isComposioConfigured) {
      this.chats.push({
        id: '4',
        title: 'Tool-enabled chat',
        messages: [
          {
            role: 'assistant',
            content: "Hello! I'm August, your AI super agent with tool capabilities. I can help you with GitHub, Gmail, and Slack integrations. What would you like to do today?"
          }
        ],
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        enabledTools: [
          'GITHUB_STAR_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER',
          'GITHUB_CREATE_AN_ISSUE',
          'SLACK_SEND_MESSAGE',
          'GMAIL_SEND_EMAIL'
        ],
        useTools: true
      });
    }
  }

  // Get all chats
  getChats() {
    return [...this.chats].sort((a, b) => b.updatedAt - a.updatedAt);
  }
  
  // Search across all chats
  searchMessages(query) {
    if (!query || query.trim() === '') {
      return [];
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    const results = [];
    
    this.chats.forEach(chat => {
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
    });
    
    return results;
  }

  // Get active chat
  getActiveChat() {
    return this.chats.find(chat => chat.id === this.activeChat) || this.chats[0];
  }

  // Set active chat
  setActiveChat(chatId) {
    this.activeChat = chatId;
    return this.getActiveChat();
  }

  // Create a new chat
  createChat(useTools = true) {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      messages: [
        {
          role: 'assistant',
          content: `Hello! I'm August, your AI super agent${useTools ? ' with tool capabilities' : ''}. How can I help you today?`
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      enabledTools: [],
      useTools: useTools
    };
    
    this.chats.unshift(newChat);
    this.activeChat = newChatId;
    return newChat;
  }

  // Delete a chat
  deleteChat(chatId) {
    this.chats = this.chats.filter(chat => chat.id !== chatId);
    
    // If we deleted the active chat, set active to the first remaining chat
    if (this.activeChat === chatId && this.chats.length > 0) {
      this.activeChat = this.chats[0].id;
    }
    
    return this.getChats();
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
    const chat = this.getActiveChat();
    if (!chat) return null;
    
    // Add user message
    const userMessage = { role: 'user', content };
    chat.messages.push(userMessage);
    
    try {
      // Send to API - use Azure if configured, otherwise use mock
      let response;
      
      // Initialize authentication status if not present
      if (!chat.authStatus) {
        chat.authStatus = {};
      }
      
      if (isAzureConfigured) {
        // Only use tools if both Azure and Composio are configured
        const canUseTools = isComposioConfigured && chat.useTools;
        
        response = await sendMessage(
          chat.messages, 
          chat.enabledTools.length > 0 ? chat.enabledTools : undefined,
          canUseTools,
          chat.authStatus
        );
      } else {
        response = await sendMessageMock(chat.messages);
      }
      
      // Add assistant response
      chat.messages.push(response);
      
      // Update chat metadata
      chat.updatedAt = new Date();
      
      // Update chat title if this is the first user message
      if (chat.messages.filter(m => m.role === 'user').length === 1) {
        // Use the first 20 chars of user's first message as the chat title
        chat.title = content.substring(0, 20) + (content.length > 20 ? '...' : '');
      }
      
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to Azure OpenAI. Please check your configuration or try again later.'
      };
      chat.messages.push(errorMessage);
      
      return errorMessage;
    }
  }
  
  // Update authentication status for a service in a chat
  updateAuthStatus(chatId, service, isAuthenticated) {
    const chat = this.chats.find(c => c.id === chatId);
    if (!chat) return false;
    
    // Initialize authStatus if not present
    if (!chat.authStatus) {
      chat.authStatus = {};
    }
    
    // Update authentication status
    chat.authStatus[service] = isAuthenticated;
    
    console.log(`Updated auth status for ${service} to ${isAuthenticated} in chat ${chatId}`);
    console.log('Current auth status:', chat.authStatus);
    
    return true;
  }
}

// Export a singleton instance
export default new ChatStore();