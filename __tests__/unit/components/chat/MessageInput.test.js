import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import MessageInput from '../../../../components/chat/MessageInput';

// Mock the dependencies
jest.mock('phosphor-react-native', () => ({
  Plus: 'MockPlusIcon',
  ArrowUp: 'MockArrowUpIcon'
}));

describe('MessageInput Component', () => {
  const defaultProps = {
    onSend: jest.fn(),
    isLoading: false,
    disabled: false
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('should render correctly', () => {
    const { getByPlaceholderText, getByTestId } = render(<MessageInput {...defaultProps} />);
    
    expect(getByPlaceholderText('Message August')).toBeTruthy();
    expect(getByTestId('send-button')).toBeTruthy();
  });

  test('should update text input value when typing', () => {
    const { getByPlaceholderText } = render(<MessageInput {...defaultProps} />);
    
    const input = getByPlaceholderText('Message August');
    fireEvent.changeText(input, 'Hello, August!');
    
    expect(input.props.value).toBe('Hello, August!');
  });

  test('should call onSend when send button is pressed', () => {
    const onSend = jest.fn();
    const { getByPlaceholderText, getByTestId } = render(
      <MessageInput {...defaultProps} onSend={onSend} />
    );
    
    const input = getByPlaceholderText('Message August');
    fireEvent.changeText(input, 'Hello, August!');
    
    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);
    
    expect(onSend).toHaveBeenCalledWith('Hello, August!');
    expect(input.props.value).toBe(''); // Input should be cleared
  });

  test('should call onSend when Enter key is pressed', () => {
    const onSend = jest.fn();
    const { getByPlaceholderText } = render(
      <MessageInput {...defaultProps} onSend={onSend} />
    );
    
    const input = getByPlaceholderText('Message August');
    fireEvent.changeText(input, 'Hello, August!');
    
    fireEvent(input, 'submitEditing');
    
    expect(onSend).toHaveBeenCalledWith('Hello, August!');
    expect(input.props.value).toBe(''); // Input should be cleared
  });

  test('should not call onSend when input is empty', () => {
    const onSend = jest.fn();
    const { getByTestId } = render(
      <MessageInput {...defaultProps} onSend={onSend} />
    );
    
    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);
    
    expect(onSend).not.toHaveBeenCalled();
  });

  test('should disable send button when input is empty', () => {
    const { getByTestId } = render(<MessageInput {...defaultProps} />);
    
    const sendButton = getByTestId('send-button');
    expect(sendButton.props.disabled).toBe(true);
  });

  test('should enable send button when input has text', () => {
    const { getByPlaceholderText, getByTestId } = render(<MessageInput {...defaultProps} />);
    
    const input = getByPlaceholderText('Message August');
    fireEvent.changeText(input, 'Hello, August!');
    
    const sendButton = getByTestId('send-button');
    expect(sendButton.props.disabled).toBe(false);
  });

  test('should show loading indicator when isLoading is true', () => {
    const { getByTestId } = render(<MessageInput {...defaultProps} isLoading={true} />);
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  test('should disable input when disabled prop is true', () => {
    const { getByPlaceholderText } = render(<MessageInput {...defaultProps} disabled={true} />);
    
    const input = getByPlaceholderText('Message August');
    expect(input.props.editable).toBe(false);
  });

  test('should handle multiline input', () => {
    const { getByPlaceholderText } = render(<MessageInput {...defaultProps} />);
    
    const input = getByPlaceholderText('Message August');
    fireEvent.changeText(input, 'Line 1\nLine 2');
    
    expect(input.props.value).toBe('Line 1\nLine 2');
  });

  test('should focus input when component mounts', () => {
    const { getByPlaceholderText } = render(<MessageInput {...defaultProps} autoFocus={true} />);
    
    const input = getByPlaceholderText('Message August');
    expect(input.props.autoFocus).toBe(true);
  });
});
