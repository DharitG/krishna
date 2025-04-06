import supabase from './supabase';
import { sendMessage as sendMessageToBackend } from './api';

/**
 * Create a new chat for the current user
 * @param {String} title - Chat title
 * @returns {Object} - New chat object
 */
export const createChat = async (title = 'New Chat') => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error getting current user:', userError.message);
      throw userError;
    }

    if (!user) {
      throw new Error('No authenticated user found');
    }

    const { data, error } = await supabase
      .from('chats')
      .insert([
        {
          title,
          user_id: user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating chat:', error.message);
    throw error;
  }
};

/**
 * Get all chats for the current user
 * @returns {Array} - List of chats
 */
export const getChats = async () => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error getting current user:', userError.message);
      throw userError;
    }

    if (!user) {
      throw new Error('No authenticated user found');
    }

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting chats:', error.message);
    throw error;
  }
};

/**
 * Get all chats with their messages for search functionality
 * @returns {Array} - List of chats with messages
 */
export const getChatsWithMessages = async () => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error getting current user:', userError.message);
      throw userError;
    }

    if (!user) {
      throw new Error('No authenticated user found');
    }

    // First get all chats
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (chatsError) throw chatsError;

    // If no chats, return empty array
    if (!chats || chats.length === 0) {
      return [];
    }

    // Get all messages for all chats
    const chatIds = chats.map(chat => chat.id);
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .in('chat_id', chatIds);

    if (messagesError) throw messagesError;

    // Group messages by chat_id
    const messagesByChatId = {};
    if (messages && messages.length > 0) {
      messages.forEach(message => {
        if (!messagesByChatId[message.chat_id]) {
          messagesByChatId[message.chat_id] = [];
        }
        messagesByChatId[message.chat_id].push(message);
      });
    }

    // Add messages to each chat
    const chatsWithMessages = chats.map(chat => ({
      ...chat,
      messages: messagesByChatId[chat.id] || []
    }));

    return chatsWithMessages;
  } catch (error) {
    console.error('Error getting chats with messages:', error.message);
    throw error;
  }
};

/**
 * Get a chat by ID
 * @param {String} chatId - Chat ID
 * @returns {Object} - Chat object with messages
 */
export const getChatById = async (chatId) => {
  try {
    // Check if this is a mock chat ID
    if (chatId.startsWith('mock-chat-')) {
      console.log('Using mock chat ID, returning empty chat structure');
      return {
        id: chatId,
        title: 'Mock Chat',
        created_at: new Date(),
        updated_at: new Date(),
        messages: []
      };
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error getting current user:', userError.message);
      throw userError;
    }

    if (!user) {
      throw new Error('No authenticated user found');
    }

    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single();

    if (chatError) throw chatError;

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    return {
      ...chat,
      messages: Array.isArray(messages) ? messages : [],
    };
  } catch (error) {
    console.error('Error getting chat by ID:', error.message);
    throw error;
  }
};

/**
 * Update a chat's title
 * @param {String} chatId - Chat ID
 * @param {String} title - New title
 * @returns {Object} - Updated chat
 */
export const updateChatTitle = async (chatId, title) => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .update({ title, updated_at: new Date() })
      .eq('id', chatId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating chat title:', error.message);
    throw error;
  }
};

/**
 * Delete a chat
 * @param {String} chatId - Chat ID
 * @returns {Boolean} - Success status
 */
export const deleteChat = async (chatId) => {
  try {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting chat:', error.message);
    throw error;
  }
};

/**
 * Add a message to a chat
 * @param {String} chatId - Chat ID
 * @param {String} role - Message role (user, assistant, system)
 * @param {String} content - Message content
 * @returns {Object} - New message
 */
export const addMessage = async (chatId, role, content) => {
  try {
    // Check if this is a mock chat ID (for fallback scenarios)
    if (chatId.startsWith('mock-chat-')) {
      console.log('Using mock chat, returning mock message');
      return {
        id: `mock-msg-${Date.now().toString().slice(-6)}`,
        chat_id: chatId,
        role,
        content,
        created_at: new Date()
      };
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error getting current user:', userError.message);
      throw userError;
    }

    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Verify the chat belongs to the user
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single();

    if (chatError) {
      console.error('Error verifying chat ownership:', chatError.message);
      throw chatError;
    }

    // Update chat updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: new Date() })
      .eq('id', chatId)
      .eq('user_id', user.id);

    // Insert new message
    const { data, error } = await supabase
      .from('messages')
      .insert([
        { chat_id: chatId, role, content }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding message:', error.message);
    throw error;
  }
};

/**
 * Send a user message and get AI response
 * @param {String} chatId - Chat ID
 * @param {String} message - User message
 * @param {Array} enabledTools - Array of enabled tools
 * @param {Boolean} useTools - Whether to use tools
 * @param {Object} authStatus - Authentication status for services
 * @param {Function} onStream - Callback for streaming responses
 * @returns {Object} - AI response message
 */
export const sendMessageAndGetResponse = async (
  chatId,
  message,
  enabledTools,
  useTools = true,
  authStatus = {},
  onStream = null
) => {
  try {
    // Check if this is a mock chat ID
    const isMockChat = chatId.startsWith('mock-chat-');

    // Add user message to database
    await addMessage(chatId, 'user', message);

    // Get chat history
    let messages = [];

    if (isMockChat) {
      // For mock chats, use the local messages array from chatStore
      // This will be handled by the caller
      const mockResponse = {
        role: 'assistant',
        content: `This is a mock response. In a real environment, I would process your message: "${message}"`
      };

      // Add mock assistant response
      await addMessage(chatId, 'assistant', mockResponse.content);

      return mockResponse;
    } else {
      // For real chats, get messages from the database
      const chat = await getChatById(chatId);
      messages = Array.isArray(chat.messages) ? chat.messages.map(({ role, content }) => ({ role, content })) : [];

      // Create message object in database with empty content (will be updated)
      const initialAssistantMessage = await addMessage(chatId, 'assistant', '');

      // Handler for streaming updates
      const handleStreamChunk = async (chunk) => {
        if (onStream) {
          // Pass streaming content to callback with the DB message ID
          onStream({
            ...chunk,
            id: initialAssistantMessage.id
          });
        }
      };

      // Get the current user ID for the backend
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Send to backend with streaming
      const response = await sendMessageToBackend(
        messages,
        enabledTools,
        useTools,
        authStatus,
        handleStreamChunk
      );

      // Update the assistant message in database with final content
      // Use Supabase's update function to update the existing message
      const { data, error } = await supabase
        .from('messages')
        .update({ content: response.content })
        .eq('id', initialAssistantMessage.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating message content:', error);
      }

      // Check if the response contains an auth redirect
      if (response.authRedirect) {
        console.log('Response contains auth redirect:', response.authRedirect);
        // We'll handle this in the UI
      }

      // Return the final response with the database ID
      return {
        ...response,
        id: initialAssistantMessage.id
      };
    }
  } catch (error) {
    console.error('Error sending message and getting response:', error.message);

    // Add error message to chat
    await addMessage(
      chatId,
      'assistant',
      'Sorry, I encountered an error processing your request. Please try again later.'
    );

    throw error;
  }
};