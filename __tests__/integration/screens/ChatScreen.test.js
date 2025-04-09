import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import ChatScreen from '../../../app/chat';
import * as chatService from '../../../services/chatService';
import * as chatStore from '../../../services/chatStore';

// Mock the dependencies
jest.mock('../../../services/chatService', () => ({
  getChats: jest.fn(),
  getChatById: jest.fn(),
  createChat: jest.fn(),
  sendMessageAndGetResponse: jest.fn()
}));

jest.mock('../../../services/chatStore', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn().mockReturnValue({ id: 'chat-1' }),
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn()
  })
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 })
}));

jest.mock('phosphor-react-native', () => ({
  Plus: 'MockPlusIcon',
  ArrowLeft: 'MockArrowLeftIcon',
  List: 'MockListIcon',
  Gear: 'MockGearIcon'
}));

describe('ChatScreen Integration', () => {
  // Mock chat data
  const mockChats = [
    {
      id: 'chat-1',
      title: 'Chat 1',
      messages: [
        { id: 'msg-1', role: 'assistant', content: 'Hello! How can I help you?' },
        { id: 'msg-2', role: 'user', content: 'Tell me about React Native' }
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
    
    // Mock chatStore default implementation
    chatStore.default.mockImplementation(() => ({
      chats: mockChats,
      activeChat: mockChats[0],
      setChats: jest.fn(),
      setActiveChat: jest.fn(),
      sendMessage: jest.fn(),
      createNewChat: jest.fn(),
      isLoading: false,
      streamingMessageId: null
    }));
    
    // Mock chatService implementations
    chatService.getChats.mockResolvedValue(mockChats);
    chatService.getChatById.mockResolvedValue(mockChats[0]);
    chatService.createChat.mockResolvedValue(mockChats[0]);
    chatService.sendMessageAndGetResponse.mockResolvedValue({
      role: 'assistant',
      content: 'React Native is a framework for building mobile apps.'
    });
  });

  test('should render chat messages', async () => {
    let component;
    
    await act(async () => {
      component = render(<ChatScreen />);
    });
    
    const { getByText } = component;
    
    expect(getByText('Hello! How can I help you?')).toBeTruthy();
    expect(getByText('Tell me about React Native')).toBeTruthy();
  });

  test('should send a message and display response', async () => {
    let component;
    
    await act(async () => {
      component = render(<ChatScreen />);
    });
    
    const { getByPlaceholderText, getByTestId } = component;
    
    // Type a message
    const input = getByPlaceholderText('Message August');
    fireEvent.changeText(input, 'What is React?');
    
    // Send the message
    const sendButton = getByTestId('send-button');
    await act(async () => {
      fireEvent.press(sendButton);
    });
    
    // Verify the message was sent
    expect(chatService.sendMessageAndGetResponse).toHaveBeenCalledWith(
      'chat-1',
      'What is React?',
      expect.any(Array),
      expect.any(Boolean),
      expect.any(Object),
      expect.any(Function),
      expect.any(Object)
    );
    
    // Wait for the response to be displayed
    await waitFor(() => {
      expect(component.getByText('React Native is a framework for building mobile apps.')).toBeTruthy();
    });
  });

  test('should create a new chat', async () => {
    // Mock createNewChat implementation
    const createNewChat = jest.fn().mockResolvedValue(mockChats[1]);
    chatStore.default.mockImplementation(() => ({
      chats: mockChats,
      activeChat: mockChats[0],
      setChats: jest.fn(),
      setActiveChat: jest.fn(),
      sendMessage: jest.fn(),
      createNewChat,
      isLoading: false,
      streamingMessageId: null
    }));
    
    let component;
    
    await act(async () => {
      component = render(<ChatScreen />);
    });
    
    const { getByTestId } = component;
    
    // Press the new chat button
    const newChatButton = getByTestId('new-chat-button');
    await act(async () => {
      fireEvent.press(newChatButton);
    });
    
    // Verify createNewChat was called
    expect(createNewChat).toHaveBeenCalled();
  });

  test('should show loading state when sending a message', async () => {
    // Mock sendMessage to delay response
    const sendMessage = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            role: 'assistant',
            content: 'React Native is a framework for building mobile apps.'
          });
        }, 100);
      });
    });
    
    chatStore.default.mockImplementation(() => ({
      chats: mockChats,
      activeChat: mockChats[0],
      setChats: jest.fn(),
      setActiveChat: jest.fn(),
      sendMessage,
      createNewChat: jest.fn(),
      isLoading: true,
      streamingMessageId: 'msg-3'
    }));
    
    let component;
    
    await act(async () => {
      component = render(<ChatScreen />);
    });
    
    const { getByTestId } = component;
    
    // Verify loading indicator is shown
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  test('should handle empty chat state', async () => {
    // Mock empty active chat
    chatStore.default.mockImplementation(() => ({
      chats: mockChats,
      activeChat: mockChats[1], // Chat with no messages
      setChats: jest.fn(),
      setActiveChat: jest.fn(),
      sendMessage: jest.fn(),
      createNewChat: jest.fn(),
      isLoading: false,
      streamingMessageId: null
    }));
    
    let component;
    
    await act(async () => {
      component = render(<ChatScreen />);
    });
    
    const { getByText } = component;
    
    // Verify empty state message is shown
    expect(getByText('Start a conversation with August')).toBeTruthy();
  });

  test('should handle error state', async () => {
    // Mock error in sendMessage
    const sendMessage = jest.fn().mockRejectedValue(new Error('Network error'));
    
    chatStore.default.mockImplementation(() => ({
      chats: mockChats,
      activeChat: mockChats[0],
      setChats: jest.fn(),
      setActiveChat: jest.fn(),
      sendMessage,
      createNewChat: jest.fn(),
      isLoading: false,
      streamingMessageId: null
    }));
    
    let component;
    
    await act(async () => {
      component = render(<ChatScreen />);
    });
    
    const { getByPlaceholderText, getByTestId } = component;
    
    // Type a message
    const input = getByPlaceholderText('Message August');
    fireEvent.changeText(input, 'What is React?');
    
    // Send the message
    const sendButton = getByTestId('send-button');
    await act(async () => {
      fireEvent.press(sendButton);
    });
    
    // Verify error handling
    expect(sendMessage).toHaveBeenCalled();
  });
});
