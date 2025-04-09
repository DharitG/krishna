import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ChatMessage from '../../../../components/chat/ChatMessage';

// Mock the dependencies
jest.mock('react-native-markdown-display', () => 'MockMarkdown');
jest.mock('../../../../components/chat/AuthButton', () => 'MockAuthButton');
jest.mock('../../../../components/chat/AuthRedirect', () => 'MockAuthRedirect');
jest.mock('../../../../components/chat/DynamicAuthBlob', () => 'MockDynamicAuthBlob');
jest.mock('../../../../components/chat/DynamicConfirmationBlob', () => 'MockDynamicConfirmationBlob');
jest.mock('../../../../services/chatStore', () => ({
  __esModule: true,
  default: () => ({
    authStatus: { github: true, gmail: false },
    setAuthStatus: jest.fn()
  })
}));

describe('ChatMessage Component', () => {
  const defaultProps = {
    message: {
      id: 'message-1',
      role: 'user',
      content: 'Hello, how are you?'
    },
    isLast: false,
    isStreaming: false
  };

  test('should render user message correctly', () => {
    const { getByText, queryByTestId } = render(<ChatMessage {...defaultProps} />);
    
    expect(getByText('Hello, how are you?')).toBeTruthy();
    expect(queryByTestId('assistant-message')).toBeNull();
  });

  test('should render assistant message correctly', () => {
    const props = {
      ...defaultProps,
      message: {
        id: 'message-2',
        role: 'assistant',
        content: 'I am doing well, thank you!'
      }
    };
    
    const { getByTestId } = render(<ChatMessage {...props} />);
    
    expect(getByTestId('assistant-message')).toBeTruthy();
  });

  test('should render markdown content for assistant messages', () => {
    const props = {
      ...defaultProps,
      message: {
        id: 'message-2',
        role: 'assistant',
        content: '# Hello\n\nThis is a markdown message.'
      }
    };
    
    const { getByTestId } = render(<ChatMessage {...props} />);
    
    const markdownComponent = getByTestId('assistant-message');
    expect(markdownComponent).toBeTruthy();
  });

  test('should render loading indicator when streaming', () => {
    const props = {
      ...defaultProps,
      message: {
        id: 'message-2',
        role: 'assistant',
        content: 'Loading...'
      },
      isStreaming: true
    };
    
    const { getByTestId } = render(<ChatMessage {...props} />);
    
    expect(getByTestId('streaming-indicator')).toBeTruthy();
  });

  test('should render auth button when message contains auth request', () => {
    const props = {
      ...defaultProps,
      message: {
        id: 'message-2',
        role: 'assistant',
        content: 'Please authenticate with GitHub [AUTH_REQUEST:GITHUB]',
        requiresAuth: true,
        service: 'GITHUB'
      }
    };
    
    const { getByTestId } = render(<ChatMessage {...props} />);
    
    expect(getByTestId('auth-button-container')).toBeTruthy();
  });

  test('should render dynamic auth blob when message contains auth request', () => {
    const props = {
      ...defaultProps,
      message: {
        id: 'message-2',
        role: 'assistant',
        content: 'I need to access your GitHub account.',
        requiresAuth: true,
        service: 'GITHUB'
      }
    };
    
    const { getByTestId } = render(<ChatMessage {...props} />);
    
    expect(getByTestId('auth-button-container')).toBeTruthy();
  });

  test('should render dynamic confirmation blob when message contains confirmation request', () => {
    const props = {
      ...defaultProps,
      message: {
        id: 'message-2',
        role: 'assistant',
        content: 'Do you want to proceed with this action?',
        requiresConfirmation: true,
        confirmationData: {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          confirmText: 'Yes',
          cancelText: 'No'
        }
      }
    };
    
    const { getByTestId } = render(<ChatMessage {...props} />);
    
    expect(getByTestId('confirmation-blob-container')).toBeTruthy();
  });

  test('should handle links in messages', () => {
    const props = {
      ...defaultProps,
      message: {
        id: 'message-2',
        role: 'assistant',
        content: 'Check out this link: https://example.com'
      }
    };
    
    const { getByTestId } = render(<ChatMessage {...props} />);
    
    expect(getByTestId('assistant-message')).toBeTruthy();
  });

  test('should handle code blocks in messages', () => {
    const props = {
      ...defaultProps,
      message: {
        id: 'message-2',
        role: 'assistant',
        content: '```javascript\nconst hello = "world";\nconsole.log(hello);\n```'
      }
    };
    
    const { getByTestId } = render(<ChatMessage {...props} />);
    
    expect(getByTestId('assistant-message')).toBeTruthy();
  });

  test('should handle error messages', () => {
    const props = {
      ...defaultProps,
      message: {
        id: 'message-2',
        role: 'assistant',
        content: 'Sorry, I encountered an error.',
        error: true
      }
    };
    
    const { getByTestId } = render(<ChatMessage {...props} />);
    
    const errorMessage = getByTestId('assistant-message');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.props.style).toEqual(expect.objectContaining({
      backgroundColor: expect.stringMatching(/^#/) // Error background color
    }));
  });
});
