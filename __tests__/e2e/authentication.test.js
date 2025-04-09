import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../../services/authContext';
import LoginScreen from '../../app/auth/login';
import SignupScreen from '../../app/auth/signup';
import * as supabaseService from '../../services/supabase';

// Mock the dependencies
jest.mock('../../services/supabase', () => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  getUser: jest.fn(),
  getSession: jest.fn()
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  useLocalSearchParams: jest.fn().mockReturnValue({}),
  Redirect: 'MockRedirect'
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children
}));

jest.mock('expo-linear-gradient', () => 'MockLinearGradient');

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

describe('Authentication End-to-End Flow', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock useRouter implementation
    require('expo-router').useRouter.mockReturnValue(mockRouter);
    
    // Mock getUser to return no user initially
    supabaseService.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });
    
    // Mock getSession to return no session initially
    supabaseService.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
  });

  test('should complete signup and login flow', async () => {
    // Mock successful signup
    supabaseService.signUp.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } }
    });
    
    // Mock successful login
    supabaseService.signIn.mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'token' }
      }
    });
    
    // Render signup screen
    let signupComponent;
    await act(async () => {
      signupComponent = render(
        <AuthProvider>
          <SignupScreen />
        </AuthProvider>
      );
    });
    
    const { getByPlaceholderText: getSignupPlaceholder, getByText: getSignupText } = signupComponent;
    
    // Fill signup form
    fireEvent.changeText(getSignupPlaceholder('Email'), 'test@example.com');
    fireEvent.changeText(getSignupPlaceholder('Password'), 'password123');
    fireEvent.changeText(getSignupPlaceholder('Confirm Password'), 'password123');
    
    // Submit signup form
    await act(async () => {
      fireEvent.press(getSignupText('Sign Up'));
    });
    
    // Verify signup was called
    expect(supabaseService.signUp).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
      expect.any(Object)
    );
    
    // Verify alert was shown
    expect(require('react-native/Libraries/Alert/Alert').alert).toHaveBeenCalledWith(
      'Registration Successful',
      'Please check your email for a confirmation link to complete your registration.'
    );
    
    // Render login screen
    let loginComponent;
    await act(async () => {
      loginComponent = render(
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      );
    });
    
    const { getByPlaceholderText: getLoginPlaceholder, getByText: getLoginText } = loginComponent;
    
    // Fill login form
    fireEvent.changeText(getLoginPlaceholder('Email'), 'test@example.com');
    fireEvent.changeText(getLoginPlaceholder('Password'), 'password123');
    
    // Submit login form
    await act(async () => {
      fireEvent.press(getLoginText('Sign In'));
    });
    
    // Verify login was called
    expect(supabaseService.signIn).toHaveBeenCalledWith(
      'test@example.com',
      'password123'
    );
    
    // Verify navigation to home
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
  });

  test('should handle password reset flow', async () => {
    // Mock successful password reset
    supabaseService.resetPassword.mockResolvedValue({
      data: {},
      error: null
    });
    
    // Render login screen
    let loginComponent;
    await act(async () => {
      loginComponent = render(
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      );
    });
    
    const { getByText } = loginComponent;
    
    // Navigate to forgot password
    await act(async () => {
      fireEvent.press(getByText('Forgot Password?'));
    });
    
    // Verify navigation
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/forgot-password');
    
    // Mock ForgotPasswordScreen
    const ForgotPasswordScreen = () => {
      const { resetPassword } = require('../../services/authContext').useAuth();
      
      const handleResetPassword = () => {
        resetPassword('test@example.com');
      };
      
      return (
        <div>
          <input placeholder="Email" />
          <button testID="reset-button" onClick={handleResetPassword}>Reset Password</button>
        </div>
      );
    };
    
    // Render forgot password screen
    let forgotPasswordComponent;
    await act(async () => {
      forgotPasswordComponent = render(
        <AuthProvider>
          <ForgotPasswordScreen />
        </AuthProvider>
      );
    });
    
    // Submit reset password form
    await act(async () => {
      fireEvent.press(forgotPasswordComponent.getByTestId('reset-button'));
    });
    
    // Verify resetPassword was called
    expect(supabaseService.resetPassword).toHaveBeenCalledWith('test@example.com');
    
    // Verify alert was shown
    expect(require('react-native/Libraries/Alert/Alert').alert).toHaveBeenCalledWith(
      'Password Reset Email Sent',
      'Check your email for a link to reset your password.'
    );
  });

  test('should handle login errors', async () => {
    // Mock login error
    supabaseService.signIn.mockRejectedValue(new Error('Invalid credentials'));
    
    // Render login screen
    let loginComponent;
    await act(async () => {
      loginComponent = render(
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      );
    });
    
    const { getByPlaceholderText, getByText } = loginComponent;
    
    // Fill login form
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrong-password');
    
    // Submit login form
    await act(async () => {
      fireEvent.press(getByText('Sign In'));
    });
    
    // Verify login was called
    expect(supabaseService.signIn).toHaveBeenCalledWith(
      'test@example.com',
      'wrong-password'
    );
    
    // Verify alert was shown
    expect(require('react-native/Libraries/Alert/Alert').alert).toHaveBeenCalledWith(
      'Sign In Error',
      'Invalid credentials'
    );
  });

  test('should handle signup errors', async () => {
    // Mock signup error
    supabaseService.signUp.mockRejectedValue(new Error('Email already registered'));
    
    // Render signup screen
    let signupComponent;
    await act(async () => {
      signupComponent = render(
        <AuthProvider>
          <SignupScreen />
        </AuthProvider>
      );
    });
    
    const { getByPlaceholderText, getByText } = signupComponent;
    
    // Fill signup form
    fireEvent.changeText(getByPlaceholderText('Email'), 'existing@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
    
    // Submit signup form
    await act(async () => {
      fireEvent.press(getByText('Sign Up'));
    });
    
    // Verify signup was called
    expect(supabaseService.signUp).toHaveBeenCalledWith(
      'existing@example.com',
      'password123',
      expect.any(Object)
    );
    
    // Verify alert was shown
    expect(require('react-native/Libraries/Alert/Alert').alert).toHaveBeenCalledWith(
      'Sign Up Error',
      'Email already registered'
    );
  });
});
