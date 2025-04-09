import * as chatService from '../../../services/chatService';
import { supabase } from '../../../services/supabase';
import { sendMessageToBackend } from '../../../services/api';

// Mock the dependencies
jest.mock('../../../services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      })
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn()
  }
}));

jest.mock('../../../services/api', () => ({
  sendMessageToBackend: jest.fn()
}));

describe('Chat Service', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createChat', () => {
    test('should create a new chat', async () => {
      // Mock supabase response
      supabase.single.mockResolvedValue({
        data: {
          id: 'chat-1',
          title: 'New Chat',
          user_id: 'user-123',
          created_at: '2023-01-01T00:00:00Z'
        },
        error: null
      });

      const result = await chatService.createChat('New Chat');

      expect(supabase.from).toHaveBeenCalledWith('chats');
      expect(supabase.insert).toHaveBeenCalledWith([
        {
          title: 'New Chat',
          user_id: 'user-123'
        }
      ]);
      expect(result).toEqual({
        id: 'chat-1',
        title: 'New Chat',
        user_id: 'user-123',
        created_at: '2023-01-01T00:00:00Z'
      });
    });

    test('should throw an error when user is not authenticated', async () => {
      // Mock getUser to return no user
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      await expect(chatService.createChat('New Chat')).rejects.toThrow('Error getting current user: Not authenticated');
    });

    test('should throw an error when database operation fails', async () => {
      // Mock supabase error
      supabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(chatService.createChat('New Chat')).rejects.toThrow('Database error');
    });
  });

  describe('getChats', () => {
    test('should get all chats for the user', async () => {
      // Mock supabase response
      const mockChats = [
        {
          id: 'chat-1',
          title: 'Chat 1',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z'
        },
        {
          id: 'chat-2',
          title: 'Chat 2',
          created_at: '2023-01-03T00:00:00Z',
          updated_at: '2023-01-04T00:00:00Z'
        }
      ];
      
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ data: mockChats, error: null })
      }));

      const result = await chatService.getChats();

      expect(supabase.from).toHaveBeenCalledWith('chats');
      expect(result).toEqual(mockChats);
    });

    test('should throw an error when database operation fails', async () => {
      // Mock supabase error
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
      }));

      await expect(chatService.getChats()).rejects.toThrow('Database error');
    });
  });

  describe('getChatById', () => {
    test('should get a specific chat by ID', async () => {
      // Mock supabase response
      const mockChat = {
        id: 'chat-1',
        title: 'Chat 1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        messages: [{ role: 'user', content: 'Hello' }]
      };
      
      supabase.single.mockResolvedValue({ data: mockChat, error: null });

      const result = await chatService.getChatById('chat-1');

      expect(supabase.from).toHaveBeenCalledWith('chats');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('id', 'chat-1');
      expect(result).toEqual(mockChat);
    });

    test('should throw an error when chat is not found', async () => {
      // Mock supabase error
      supabase.single.mockResolvedValue({ data: null, error: { message: 'Chat not found' } });

      await expect(chatService.getChatById('non-existent-chat')).rejects.toThrow('Chat not found');
    });
  });

  describe('addMessage', () => {
    test('should add a message to a chat', async () => {
      // Mock supabase responses
      supabase.single.mockResolvedValueOnce({
        data: { id: 'chat-1', user_id: 'user-123' },
        error: null
      });
      
      supabase.single.mockResolvedValueOnce({
        data: {
          id: 'message-1',
          chat_id: 'chat-1',
          role: 'user',
          content: 'Hello',
          created_at: '2023-01-01T00:00:00Z'
        },
        error: null
      });

      const result = await chatService.addMessage('chat-1', 'user', 'Hello');

      expect(supabase.from).toHaveBeenCalledWith('chats');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('id', 'chat-1');
      
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(supabase.insert).toHaveBeenCalledWith([
        { chat_id: 'chat-1', role: 'user', content: 'Hello' }
      ]);
      
      expect(result).toEqual({
        id: 'message-1',
        chat_id: 'chat-1',
        role: 'user',
        content: 'Hello',
        created_at: '2023-01-01T00:00:00Z'
      });
    });

    test('should handle mock chat IDs', async () => {
      const result = await chatService.addMessage('mock-chat-123', 'user', 'Hello');

      expect(supabase.from).not.toHaveBeenCalled();
      expect(result).toEqual({
        id: expect.stringMatching(/^mock-msg-\d{6}$/),
        chat_id: 'mock-chat-123',
        role: 'user',
        content: 'Hello',
        created_at: expect.any(Date)
      });
    });

    test('should throw an error when chat verification fails', async () => {
      // Mock supabase error
      supabase.single.mockResolvedValue({ data: null, error: { message: 'Chat not found' } });

      await expect(chatService.addMessage('chat-1', 'user', 'Hello')).rejects.toThrow('Chat not found');
    });
  });

  describe('sendMessageAndGetResponse', () => {
    test('should send a message and get AI response', async () => {
      // Mock addMessage
      const addMessageSpy = jest.spyOn(chatService, 'addMessage').mockImplementation(async (chatId, role, content) => {
        return {
          id: 'message-1',
          chat_id: chatId,
          role,
          content,
          created_at: new Date()
        };
      });
      
      // Mock sendMessageToBackend
      sendMessageToBackend.mockResolvedValue({
        role: 'assistant',
        content: 'Hello! How can I help you today?'
      });

      const result = await chatService.sendMessageAndGetResponse(
        'chat-1',
        'Hello',
        ['github'],
        true,
        { github: true },
        null,
        { timezone: 'America/New_York' }
      );

      expect(addMessageSpy).toHaveBeenCalledWith('chat-1', 'user', 'Hello');
      expect(addMessageSpy).toHaveBeenCalledWith('chat-1', 'assistant', expect.any(String));
      expect(sendMessageToBackend).toHaveBeenCalled();
      expect(supabase.update).toHaveBeenCalled();
      expect(result).toEqual({
        role: 'assistant',
        content: 'Hello! How can I help you today?'
      });
      
      // Restore the original implementation
      addMessageSpy.mockRestore();
    });

    test('should handle streaming responses', async () => {
      // Mock addMessage
      const addMessageSpy = jest.spyOn(chatService, 'addMessage').mockImplementation(async (chatId, role, content) => {
        return {
          id: 'message-1',
          chat_id: chatId,
          role,
          content,
          created_at: new Date()
        };
      });
      
      // Mock sendMessageToBackend
      sendMessageToBackend.mockResolvedValue({
        role: 'assistant',
        content: 'Hello! How can I help you today?'
      });

      // Create a mock streaming callback
      const onStream = jest.fn();

      const result = await chatService.sendMessageAndGetResponse(
        'chat-1',
        'Hello',
        ['github'],
        true,
        { github: true },
        onStream,
        { timezone: 'America/New_York' }
      );

      expect(addMessageSpy).toHaveBeenCalledWith('chat-1', 'user', 'Hello');
      expect(addMessageSpy).toHaveBeenCalledWith('chat-1', 'assistant', expect.any(String));
      expect(sendMessageToBackend).toHaveBeenCalledWith(
        expect.any(Array),
        ['github'],
        true,
        { github: true },
        onStream,
        { timezone: 'America/New_York' },
        'chat-1'
      );
      expect(result).toEqual({
        role: 'assistant',
        content: 'Hello! How can I help you today?'
      });
      
      // Restore the original implementation
      addMessageSpy.mockRestore();
    });

    test('should handle errors', async () => {
      // Mock addMessage
      const addMessageSpy = jest.spyOn(chatService, 'addMessage').mockImplementation(async (chatId, role, content) => {
        return {
          id: 'message-1',
          chat_id: chatId,
          role,
          content,
          created_at: new Date()
        };
      });
      
      // Mock sendMessageToBackend to throw an error
      sendMessageToBackend.mockRejectedValue(new Error('API error'));

      const result = await chatService.sendMessageAndGetResponse(
        'chat-1',
        'Hello',
        ['github'],
        true,
        { github: true }
      );

      expect(addMessageSpy).toHaveBeenCalledWith('chat-1', 'user', 'Hello');
      expect(addMessageSpy).toHaveBeenCalledWith('chat-1', 'assistant', expect.any(String));
      expect(sendMessageToBackend).toHaveBeenCalled();
      expect(result).toEqual({
        role: 'assistant',
        content: expect.stringContaining('Sorry, I encountered an error'),
        error: true
      });
      
      // Restore the original implementation
      addMessageSpy.mockRestore();
    });
  });
});
