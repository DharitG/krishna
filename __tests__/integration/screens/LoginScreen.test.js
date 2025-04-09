import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../../app/auth/login';
import { useAuth } from '../../../services/authContext';

// Mock the dependencies
jest.mock('../../../services/authContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  })
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 })
}));

jest.mock('expo-linear-gradient', () => 'MockLinearGradient');

describe('LoginScreen Integration', () => {
  // Mock auth context
  const mockSignIn = jest.fn();
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock useAuth implementation
    useAuth.mockReturnValue({
      signIn: mockSignIn,
      loading: false
    });
    
    // Mock useRouter implementation
    require('expo-router').useRouter.mockReturnValue(mockRouter);
  });

  test('should render login form', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText('Don\'t have an account?')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByText('Forgot Password?')).toBeTruthy();
  });

  test('should validate email format', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<LoginScreen />);
    
    // Type invalid email
    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'invalid-email');
    
    // Submit form
    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);
    
    // Verify validation error
    expect(queryByText('Please enter a valid email address')).toBeTruthy();
    
    // Type valid email
    fireEvent.changeText(emailInput, 'valid@example.com');
    
    // Submit form again
    fireEvent.press(signInButton);
    
    // Verify validation error is gone
    expect(queryByText('Please enter a valid email address')).toBeNull();
  });

  test('should validate password length', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<LoginScreen />);
    
    // Type valid email
    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'valid@example.com');
    
    // Type short password
    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, '123');
    
    // Submit form
    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);
    
    // Verify validation error
    expect(queryByText('Password must be at least 6 characters')).toBeTruthy();
    
    // Type valid password
    fireEvent.changeText(passwordInput, 'password123');
    
    // Submit form again
    fireEvent.press(signInButton);
    
    // Verify validation error is gone
    expect(queryByText('Password must be at least 6 characters')).toBeNull();
  });

  test('should call signIn when form is valid', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    // Type valid email
    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'valid@example.com');
    
    // Type valid password
    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'password123');
    
    // Submit form
    const signInButton = getByText('Sign In');
    await act(async () => {
      fireEvent.press(signInButton);
    });
    
    // Verify signIn was called with correct arguments
    expect(mockSignIn).toHaveBeenCalledWith('valid@example.com', 'password123');
  });

  test('should navigate to sign up screen', async () => {
    const { getByText } = render(<LoginScreen />);
    
    // Press sign up link
    const signUpLink = getByText('Sign Up');
    await act(async () => {
      fireEvent.press(signUpLink);
    });
    
    // Verify navigation
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/signup');
  });

  test('should navigate to forgot password screen', async () => {
    const { getByText } = render(<LoginScreen />);
    
    // Press forgot password link
    const forgotPasswordLink = getByText('Forgot Password?');
    await act(async () => {
      fireEvent.press(forgotPasswordLink);
    });
    
    // Verify navigation
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/forgot-password');
  });

  test('should show loading state', async () => {
    // Mock loading state
    useAuth.mockReturnValue({
      signIn: mockSignIn,
      loading: true
    });
    
    const { getByTestId } = render(<LoginScreen />);
    
    // Verify loading indicator is shown
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  test('should navigate to home on successful login', async () => {
    // Mock successful login
    mockSignIn.mockResolvedValue({});
    
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    // Type valid email
    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'valid@example.com');
    
    // Type valid password
    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'password123');
    
    // Submit form
    const signInButton = getByText('Sign In');
    await act(async () => {
      fireEvent.press(signInButton);
    });
    
    // Verify navigation
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
  });

  test('should handle login error', async () => {
    // Mock login error
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'));
    
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    // Type valid email
    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'valid@example.com');
    
    // Type valid password
    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'password123');
    
    // Submit form
    const signInButton = getByText('Sign In');
    await act(async () => {
      fireEvent.press(signInButton);
    });
    
    // Verify error handling
    expect(mockSignIn).toHaveBeenCalled();
  });

  test('should toggle password visibility', async () => {
    const { getByPlaceholderText, getByTestId } = render(<LoginScreen />);
    
    // Get password input
    const passwordInput = getByPlaceholderText('Password');
    expect(passwordInput.props.secureTextEntry).toBe(true);
    
    // Press toggle button
    const toggleButton = getByTestId('toggle-password-visibility');
    await act(async () => {
      fireEvent.press(toggleButton);
    });
    
    // Verify password is visible
    expect(passwordInput.props.secureTextEntry).toBe(false);
    
    // Press toggle button again
    await act(async () => {
      fireEvent.press(toggleButton);
    });
    
    // Verify password is hidden again
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});
