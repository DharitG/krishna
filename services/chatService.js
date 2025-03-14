import supabase from './supabase';
import { sendMessage as sendMessageToAI } from './api';

/**
 * Create a new chat for the current user
 * @param {String} title - Chat title
 * @returns {Object} - New chat object
 */
export const createChat = async (title = 'New Chat') => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert([
        { title }
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
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting chats:', error.message);
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
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
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
      messages: messages || [],
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
    // Update chat updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: new Date() })
      .eq('id', chatId);

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
 * @returns {Object} - AI response message
 */
export const sendMessageAndGetResponse = async (
  chatId, 
  message, 
  enabledTools, 
  useTools = true,
  authStatus = {}
) => {
  try {
    // Add user message to database
    await addMessage(chatId, 'user', message);

    // Get chat history
    const chat = await getChatById(chatId);
    const messages = chat.messages.map(({ role, content }) => ({ role, content }));

    // Send to Azure OpenAI
    const response = await sendMessageToAI(messages, enabledTools, useTools, authStatus);

    // Add assistant response to database
    await addMessage(chatId, 'assistant', response.content);

    return response;
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