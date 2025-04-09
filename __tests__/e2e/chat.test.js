import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../../services/authContext';
import ChatScreen from '../../app/chat';
import * as supabaseService from '../../services/supabase';
import * as chatService from '../../services/chatService';
import * as api from '../../services/api';

// Mock the dependencies
jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn()
    }
  },
  getUser: jest.fn(),
  getSession: jest.fn()
}));

jest.mock('../../services/chatService', () => ({
  getChats: jest.fn(),
  getChatById: jest.fn(),
  createChat: jest.fn(),
  sendMessageAndGetResponse: jest.fn(),
  addMessage: jest.fn()
}));

jest.mock('../../services/api', () => ({
  sendMessageToBackend: jest.fn(),
  getAuthToken: jest.fn()
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  useLocalSearchParams: jest.fn().mockReturnValue({}),
  Link: 'MockLink',
  Stack: 'MockStack'
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children
}));

jest.mock('phosphor-react-native', () => ({
  Plus: 'MockPlusIcon',
  ArrowLeft: 'MockArrowLeftIcon',
  List: 'MockListIcon',
  Gear: 'MockGearIcon',
  ArrowUp: 'MockArrowUpIcon'
}));

describe('Chat End-to-End Flow', () => {
  // Mock chat data
  const mockChats = [
    {
      id: 'chat-1',
      title: 'Chat 1',
      messages: [
        { id: 'msg-1', role: 'assistant', content: 'Hello! How can I help you?' }
      ]
    },
    {
      id: 'chat-2',
      title: 'Chat 2',
      messages: []
    }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock authenticated user
    supabaseService.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null
    });
    
    supabaseService.getSession.mockResolvedValue({
      data: { session: { access_token: 'token' } },
      error: null
    });
    
    // Mock chat service
    chatService.getChats.mockResolvedValue(mockChats);
    chatService.getChatById.mockResolvedValue(mockChats[0]);
    chatService.createChat.mockResolvedValue({
      id: 'new-chat-1',
      title: 'New Chat',
      messages: [
        { id: 'new-msg-1', role: 'assistant', content: 'Hello! How can I help you?' }
      ]
    });
    chatService.sendMessageAndGetResponse.mockImplementation((chatId, message) => {
      return Promise.resolve({
        id: 'response-msg-1',
        role: 'assistant',
        content: `You said: ${message}`
      });
    });
    chatService.addMessage.mockImplementation((chatId, role, content) => {
      return Promise.resolve({
        id: `msg-${Date.now()}`,
        chat_id: chatId,
        role,
        content,
        created_at: new Date()
      });
    });
    
    // Mock API
    api.sendMessageToBackend.mockImplementation((messages) => {
      const userMessage = messages[messages.length - 1].content;
      return Promise.resolve({
        role: 'assistant',
        content: `You said: ${userMessage}`
      });
    });
    api.getAuthToken.mockResolvedValue('token');
  });

  test('should complete a full chat conversation flow', async () => {
    // Render chat screen
    let component;
    await act(async () => {
      component = render(
        <AuthProvider>
          <ChatScreen />
        </AuthProvider>
      );
    });
    
    const { getByPlaceholderText, getByText, getByTestId, queryByText } = component;
    
    // Verify initial message is displayed
    expect(getByText('Hello! How can I help you?')).toBeTruthy();
    
    // Send a message
    const input = getByPlaceholderText('Message August');
    fireEvent.changeText(input, 'Tell me about React Native');
    
    const sendButton = getByTestId('send-button');
    await act(async () => {
      fireEvent.press(sendButton);
    });
    
    // Verify user message is displayed
    expect(getByText('Tell me about React Native')).toBeTruthy();
    
    // Verify assistant response is displayed
    await waitFor(() => {
      expect(getByText('You said: Tell me about React Native')).toBeTruthy();
    });
    
    // Create a new chat
    const newChatButton = getByTestId('new-chat-button');
    await act(async () => {
      fireEvent.press(newChatButton);
    });
    
    // Verify new chat is created
    expect(chatService.createChat).toHaveBeenCalled();
    
    // Send a message in the new chat
    fireEvent.changeText(input, 'What is JavaScript?');
    
    await act(async () => {
      fireEvent.press(sendButton);
    });
    
    // Verify user message is displayed
    expect(getByText('What is JavaScript?')).toBeTruthy();
    
    // Verify assistant response is displayed
    await waitFor(() => {
      expect(getByText('You said: What is JavaScript?')).toBeTruthy();
    });
  });

  test('should handle tool authentication flow', async () => {
    // Mock a message that requires authentication
    chatService.sendMessageAndGetResponse.mockResolvedValueOnce({
      id: 'auth-msg-1',
      role: 'assistant',
      content: 'I need to access your GitHub account to complete this task.',
      requiresAuth: true,
      service: 'github'
    });
    
    // Render chat screen
    let component;
    await act(async () => {
      component = render(
        <AuthProvider>
          <ChatScreen />
        </AuthProvider>
      );
    });
    
    const { getByPlaceholderText, getByText, getByTestId } = component;
    
    // Send a message that will trigger auth request
    const input = getByPlaceholderText('Message August');
    fireEvent.changeText(input, 'Show me my GitHub repos');
    
    const sendButton = getByTestId('send-button');
    await act(async () => {
      fireEvent.press(sendButton);
    });
    
    // Verify auth request is displayed
    await waitFor(() => {
      expect(getByText('I need to access your GitHub account to complete this task.')).toBeTruthy();
    });
    
    // Verify auth button is displayed
    const authButton = getByTestId('auth-button');
    expect(authButton).toBeTruthy();
    
    // Mock successful authentication
    chatService.sendMessageAndGetResponse.mockResolvedValueOnce({
      id: 'auth-success-msg-1',
      role: 'assistant',
      content: 'Great! I can now access your GitHub repositories.'
    });
    
    // Press auth button
    await act(async () => {
      fireEvent.press(authButton);
    });
    
    // Verify success message is displayed
    await waitFor(() => {
      expect(getByText('Great! I can now access your GitHub repositories.')).toBeTruthy();
    });
  });

  test('should handle streaming responses', async () => {
    // Mock streaming response
    let streamCallback;
    chatService.sendMessageAndGetResponse.mockImplementation((chatId, message, enabledTools, useTools, authStatus, onStream) => {
      streamCallback = onStream;
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            id: 'stream-msg-1',
            role: 'assistant',
            content: 'This is a streaming response.'
          });
        }, 500);
      });
    });
    
    // Render chat screen
    let component;
    await act(async () => {
      component = render(
        <AuthProvider>
          <ChatScreen />
        </AuthProvider>
      );
    });
    
    const { getByPlaceholderText, getByTestId, queryByText } = component;
    
    // Send a message
    const input = getByPlaceholderText('Message August');
    fireEvent.changeText(input, 'Tell me a story');
    
    const sendButton = getByTestId('send-button');
    await act(async () => {
      fireEvent.press(sendButton);
    });
    
    // Simulate streaming response
    await act(async () => {
      streamCallback('Once');
    });
    
    expect(queryByText('Once')).toBeTruthy();
    
    await act(async () => {
      streamCallback('Once upon');
    });
    
    expect(queryByText('Once upon')).toBeTruthy();
    
    await act(async () => {
      streamCallback('Once upon a time');
    });
    
    expect(queryByText('Once upon a time')).toBeTruthy();
    
    // Wait for final response
    await waitFor(() => {
      expect(queryByText('This is a streaming response.')).toBeTruthy();
    });
  });

  test('should handle error responses', async () => {
    // Mock error response
    chatService.sendMessageAndGetResponse.mockRejectedValueOnce(new Error('Network error'));
    
    // Render chat screen
    let component;
    await act(async () => {
      component = render(
        <AuthProvider>
          <ChatScreen />
        </AuthProvider>
      );
    });
    
    const { getByPlaceholderText, getByTestId, queryByText } = component;
    
    // Send a message
    const input = getByPlaceholderText('Message August');
    fireEvent.changeText(input, 'This will cause an error');
    
    const sendButton = getByTestId('send-button');
    await act(async () => {
      fireEvent.press(sendButton);
    });
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(queryByText(/Sorry, I encountered an error/)).toBeTruthy();
    });
  });
});
