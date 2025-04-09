import * as supabaseService from '../../../services/supabase';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Mock the dependencies
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn()
    }
  })
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

describe('Supabase Service', () => {
  let mockSupabase;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Get the mocked supabase client
    mockSupabase = createClient();
  });

  describe('signUp', () => {
    test('should sign up a user successfully', async () => {
      // Mock successful sign up
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null
      });

      const result = await supabaseService.signUp('test@example.com', 'password', { name: 'Test User' });

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: { name: 'Test User' }
        }
      });
      
      expect(result).toEqual({
        data: { user: { id: 'user-123', email: 'test@example.com' } }
      });
    });

    test('should throw an error when sign up fails', async () => {
      // Mock failed sign up
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already registered' }
      });

      await expect(supabaseService.signUp('test@example.com', 'password')).rejects.toThrow('Email already registered');
      expect(mockSupabase.auth.signUp).toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    test('should sign in a user successfully', async () => {
      // Mock successful sign in
      mockSupabase.auth.signIn.mockResolvedValue({
        data: { 
          user: { id: 'user-123', email: 'test@example.com' },
          session: { access_token: 'token' }
        },
        error: null
      });

      const result = await supabaseService.signIn('test@example.com', 'password');

      expect(mockSupabase.auth.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
      
      expect(result).toEqual({
        data: { 
          user: { id: 'user-123', email: 'test@example.com' },
          session: { access_token: 'token' }
        }
      });
      
      // Check if token is stored
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'token');
    });

    test('should throw an error when sign in fails', async () => {
      // Mock failed sign in
      mockSupabase.auth.signIn.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      });

      await expect(supabaseService.signIn('test@example.com', 'wrong-password')).rejects.toThrow('Invalid credentials');
      expect(mockSupabase.auth.signIn).toHaveBeenCalled();
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    test('should sign out a user successfully', async () => {
      // Mock successful sign out
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      });

      await supabaseService.signOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    });

    test('should throw an error when sign out fails', async () => {
      // Mock failed sign out
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Error signing out' }
      });

      await expect(supabaseService.signOut()).rejects.toThrow('Error signing out');
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    test('should reset password successfully', async () => {
      // Mock successful password reset
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null
      });

      const result = await supabaseService.resetPassword('test@example.com');

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual({ data: {} });
    });

    test('should throw an error when password reset fails', async () => {
      // Mock failed password reset
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'Email not found' }
      });

      await expect(supabaseService.resetPassword('unknown@example.com')).rejects.toThrow('Email not found');
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    test('should get session successfully', async () => {
      // Mock successful get session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null
      });

      const result = await supabaseService.getSession();

      expect(mockSupabase.auth.getSession).toHaveBeenCalled();
      expect(result).toEqual({
        data: { session: { access_token: 'token' } },
        error: null
      });
    });
  });

  describe('getUser', () => {
    test('should get user successfully', async () => {
      // Mock successful get user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null
      });

      const result = await supabaseService.getUser();

      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(result).toEqual({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null
      });
    });
  });
});
