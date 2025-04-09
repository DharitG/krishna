import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../../services/authContext';
import * as supabaseService from '../../../services/supabase';
import { Alert } from 'react-native';

// Mock the dependencies
jest.mock('../../../services/supabase', () => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  getUser: jest.fn(),
  getSession: jest.fn()
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

// Test component that uses the auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div data-testid="auth-state">
      {JSON.stringify({
        isAuthenticated: auth.isAuthenticated,
        loading: auth.loading,
        user: auth.user
      })}
    </div>
  );
};

describe('Auth Context', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('should provide initial auth state', async () => {
    // Mock getUser to return no user initially
    supabaseService.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    let component;
    await act(async () => {
      component = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      const authState = JSON.parse(component.getByTestId('auth-state').props.children);
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.loading).toBe(false);
      expect(authState.user).toBeNull();
    });
  });

  test('should update auth state when user is authenticated', async () => {
    // Mock getUser to return a user
    supabaseService.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null
    });

    let component;
    await act(async () => {
      component = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      const authState = JSON.parse(component.getByTestId('auth-state').props.children);
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.loading).toBe(false);
      expect(authState.user).toEqual({ id: 'user-123', email: 'test@example.com' });
    });
  });

  test('should handle sign in', async () => {
    // Mock signIn to return a user
    supabaseService.signIn.mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'token' }
      }
    });

    // Create a wrapper component to access the auth context
    const SignInTestComponent = () => {
      const { signIn } = useAuth();
      
      React.useEffect(() => {
        signIn('test@example.com', 'password');
      }, []);
      
      return null;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <SignInTestComponent />
        </AuthProvider>
      );
    });

    expect(supabaseService.signIn).toHaveBeenCalledWith('test@example.com', 'password');
  });

  test('should handle sign up', async () => {
    // Mock signUp to return a user
    supabaseService.signUp.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } }
    });

    // Create a wrapper component to access the auth context
    const SignUpTestComponent = () => {
      const { signUp } = useAuth();
      
      React.useEffect(() => {
        signUp('test@example.com', 'password', { name: 'Test User' });
      }, []);
      
      return null;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <SignUpTestComponent />
        </AuthProvider>
      );
    });

    expect(supabaseService.signUp).toHaveBeenCalledWith('test@example.com', 'password', { name: 'Test User' });
    expect(Alert.alert).toHaveBeenCalledWith(
      'Registration Successful',
      'Please check your email for a confirmation link to complete your registration.'
    );
  });

  test('should handle sign out', async () => {
    // Mock signOut to succeed
    supabaseService.signOut.mockResolvedValue();

    // Create a wrapper component to access the auth context
    const SignOutTestComponent = () => {
      const { signOut } = useAuth();
      
      React.useEffect(() => {
        signOut();
      }, []);
      
      return null;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <SignOutTestComponent />
        </AuthProvider>
      );
    });

    expect(supabaseService.signOut).toHaveBeenCalled();
  });

  test('should handle reset password', async () => {
    // Mock resetPassword to succeed
    supabaseService.resetPassword.mockResolvedValue({ data: {} });

    // Create a wrapper component to access the auth context
    const ResetPasswordTestComponent = () => {
      const { resetPassword } = useAuth();
      
      React.useEffect(() => {
        resetPassword('test@example.com');
      }, []);
      
      return null;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <ResetPasswordTestComponent />
        </AuthProvider>
      );
    });

    expect(supabaseService.resetPassword).toHaveBeenCalledWith('test@example.com');
    expect(Alert.alert).toHaveBeenCalledWith(
      'Password Reset Email Sent',
      'Check your email for a link to reset your password.'
    );
  });

  test('should handle errors', async () => {
    // Mock signIn to throw an error
    supabaseService.signIn.mockRejectedValue(new Error('Invalid credentials'));

    // Create a wrapper component to access the auth context
    const ErrorTestComponent = () => {
      const { signIn } = useAuth();
      
      React.useEffect(() => {
        signIn('test@example.com', 'wrong-password').catch(() => {});
      }, []);
      
      return null;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <ErrorTestComponent />
        </AuthProvider>
      );
    });

    expect(supabaseService.signIn).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith('Sign In Error', 'Invalid credentials');
  });
});
