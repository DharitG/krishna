import { api, getAuthToken, sendMessageToBackend, testBackendConnection } from '../../../services/api';
import { supabase } from '../../../services/supabase';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Mock the dependencies
jest.mock('../../../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn()
    }
  }
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      BACKEND_URL: 'http://localhost:3000'
    }
  }
}));

// Mock fetch
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getAuthToken', () => {
    test('should get token from Supabase session', async () => {
      // Mock Supabase session
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'supabase-token'
          }
        },
        error: null
      });

      const token = await getAuthToken();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(token).toBe('supabase-token');
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    });

    test('should fall back to SecureStore when Supabase session is not available', async () => {
      // Mock Supabase session not available
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      // Mock SecureStore token
      SecureStore.getItemAsync.mockResolvedValue('secure-store-token');

      const token = await getAuthToken();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
      expect(token).toBe('secure-store-token');
    });

    test('should return null when no token is available', async () => {
      // Mock Supabase session not available
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      // Mock SecureStore token not available
      SecureStore.getItemAsync.mockResolvedValue(null);

      const token = await getAuthToken();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
      expect(token).toBeNull();
    });
  });

  describe('testBackendConnection', () => {
    test('should return success when backend is reachable', async () => {
      // Mock successful fetch
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Backend API is working!' })
      });

      const result = await testBackendConnection();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/test');
      expect(result).toEqual({
        success: true,
        data: { message: 'Backend API is working!' }
      });
    });

    test('should return error when backend is not reachable', async () => {
      // Mock failed fetch
      global.fetch.mockRejectedValue(new Error('Network error'));

      const result = await testBackendConnection();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/test');
      expect(result).toEqual({
        success: false,
        error: { message: 'Network error' }
      });
    });

    test('should return error when backend returns non-OK response', async () => {
      // Mock non-OK fetch response
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await testBackendConnection();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/test');
      expect(result).toEqual({
        success: false,
        error: { message: 'HTTP Error: 500 Internal Server Error' }
      });
    });
  });

  describe('sendMessageToBackend', () => {
    test('should send message to backend and return response', async () => {
      // Mock successful fetch
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          role: 'assistant',
          content: 'Hello! How can I help you today?'
        })
      });

      const messages = [
        { role: 'user', content: 'Hello' }
      ];
      
      const result = await sendMessageToBackend(
        messages,
        ['github'],
        true,
        { github: true },
        null,
        { timezone: 'America/New_York' },
        'chat-1'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/chats/chat-1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            messages,
            enabledTools: ['github'],
            stream: false,
            authStatus: { github: true },
            contextData: { timezone: 'America/New_York' }
          })
        })
      );
      
      expect(result).toEqual({
        role: 'assistant',
        content: 'Hello! How can I help you today?'
      });
    });

    test('should handle streaming responses', async () => {
      // Mock EventSource for streaming
      const mockEventSource = {
        addEventListener: jest.fn(),
        onerror: null,
        close: jest.fn()
      };
      
      // Mock window.EventSource
      global.EventSource = jest.fn().mockImplementation(() => mockEventSource);

      const messages = [
        { role: 'user', content: 'Hello' }
      ];
      
      const onStream = jest.fn();
      
      // Call the function with streaming
      sendMessageToBackend(
        messages,
        ['github'],
        true,
        { github: true },
        onStream,
        { timezone: 'America/New_York' },
        'chat-1'
      );

      // Verify EventSource was created with the correct URL
      expect(global.EventSource).toHaveBeenCalledWith(
        'http://localhost:3000/api/chats/chat-1/messages/stream?messages=' + 
        encodeURIComponent(JSON.stringify(messages)) +
        '&enabledTools=' + encodeURIComponent(JSON.stringify(['github'])) +
        '&authStatus=' + encodeURIComponent(JSON.stringify({ github: true })) +
        '&contextData=' + encodeURIComponent(JSON.stringify({ timezone: 'America/New_York' }))
      );
      
      // Verify event listeners were added
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith('done', expect.any(Function));
    });

    test('should handle errors', async () => {
      // Mock failed fetch
      global.fetch.mockRejectedValue(new Error('Network error'));

      const messages = [
        { role: 'user', content: 'Hello' }
      ];
      
      await expect(sendMessageToBackend(messages)).rejects.toThrow('Network error');
    });
  });

  describe('api interceptors', () => {
    test('should add auth token to requests', async () => {
      // Mock getAuthToken to return a token
      const getAuthTokenSpy = jest.spyOn({ getAuthToken }, 'getAuthToken').mockResolvedValue('test-token');
      
      // Create a mock request config
      const config = {
        headers: {}
      };
      
      // Get the request interceptor
      const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
      
      // Call the interceptor
      const result = await requestInterceptor(config);
      
      expect(result.headers.Authorization).toBe('Bearer test-token');
      
      // Restore the original implementation
      getAuthTokenSpy.mockRestore();
    });
  });
});
