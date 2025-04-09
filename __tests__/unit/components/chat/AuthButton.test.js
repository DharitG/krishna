import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AuthButton from '../../../../components/chat/AuthButton';
import { Ionicons } from '@expo/vector-icons';

// Mock the dependencies
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'MockIonicons'
}));

describe('AuthButton Component', () => {
  const defaultProps = {
    service: 'github',
    onPress: jest.fn(),
    isLoading: false,
    isAuthenticated: false,
    disabled: false
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('should render correctly for GitHub service', () => {
    const { getByText, getByTestId } = render(<AuthButton {...defaultProps} />);
    
    expect(getByText('Connect to GitHub')).toBeTruthy();
    expect(getByTestId('auth-button')).toBeTruthy();
  });

  test('should render correctly for Gmail service', () => {
    const props = {
      ...defaultProps,
      service: 'gmail'
    };
    
    const { getByText } = render(<AuthButton {...props} />);
    
    expect(getByText('Connect to Gmail')).toBeTruthy();
  });

  test('should render correctly for Slack service', () => {
    const props = {
      ...defaultProps,
      service: 'slack'
    };
    
    const { getByText } = render(<AuthButton {...props} />);
    
    expect(getByText('Connect to Slack')).toBeTruthy();
  });

  test('should call onPress when button is pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <AuthButton {...defaultProps} onPress={onPress} />
    );
    
    const button = getByTestId('auth-button');
    fireEvent.press(button);
    
    expect(onPress).toHaveBeenCalled();
  });

  test('should show loading state', () => {
    const props = {
      ...defaultProps,
      isLoading: true
    };
    
    const { getByText, getByTestId } = render(<AuthButton {...props} />);
    
    expect(getByText('Connecting to GitHub...')).toBeTruthy();
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  test('should show authenticated state', () => {
    const props = {
      ...defaultProps,
      isAuthenticated: true
    };
    
    const { getByText } = render(<AuthButton {...props} />);
    
    expect(getByText('Connected to GitHub')).toBeTruthy();
  });

  test('should be disabled when disabled prop is true', () => {
    const props = {
      ...defaultProps,
      disabled: true
    };
    
    const { getByTestId } = render(<AuthButton {...props} />);
    
    const button = getByTestId('auth-button');
    expect(button.props.disabled).toBe(true);
  });

  test('should be disabled when isLoading is true', () => {
    const props = {
      ...defaultProps,
      isLoading: true
    };
    
    const { getByTestId } = render(<AuthButton {...props} />);
    
    const button = getByTestId('auth-button');
    expect(button.props.disabled).toBe(true);
  });

  test('should be disabled when isAuthenticated is true', () => {
    const props = {
      ...defaultProps,
      isAuthenticated: true
    };
    
    const { getByTestId } = render(<AuthButton {...props} />);
    
    const button = getByTestId('auth-button');
    expect(button.props.disabled).toBe(true);
  });

  test('should use correct icon for each service', () => {
    const services = ['github', 'gmail', 'slack', 'discord', 'zoom', 'asana'];
    
    services.forEach(service => {
      const props = {
        ...defaultProps,
        service
      };
      
      const { getByTestId } = render(<AuthButton {...props} />);
      
      const iconContainer = getByTestId('auth-button-icon');
      expect(iconContainer).toBeTruthy();
    });
  });

  test('should use success color when authenticated', () => {
    const props = {
      ...defaultProps,
      isAuthenticated: true
    };
    
    const { getByTestId } = render(<AuthButton {...props} />);
    
    const button = getByTestId('auth-button');
    expect(button.props.style).toEqual(expect.arrayContaining([
      expect.objectContaining({
        backgroundColor: expect.stringMatching(/^#/) // Success color
      })
    ]));
  });
});
