import { sendMessageMock } from './api';

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
            content: "Hello! I'm August, your AI super agent. How can I help you today?"
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
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
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
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
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];
    this.activeChat = '1';
  }

  // Get all chats
  getChats() {
    return [...this.chats].sort((a, b) => b.updatedAt - a.updatedAt);
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
  createChat() {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      messages: [
        {
          role: 'assistant',
          content: "Hello! I'm August, your AI super agent. How can I help you today?"
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
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

  // Send a message in the active chat
  async sendMessage(content) {
    const chat = this.getActiveChat();
    if (!chat) return null;
    
    // Add user message
    const userMessage = { role: 'user', content };
    chat.messages.push(userMessage);
    
    try {
      // Send to API
      const response = await sendMessageMock(chat.messages);
      
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
        content: 'Sorry, I encountered an error. Please try again.'
      };
      chat.messages.push(errorMessage);
      
      return errorMessage;
    }
  }
}

// Export a singleton instance
export default new ChatStore();