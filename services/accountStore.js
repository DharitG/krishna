import Constants from 'expo-constants';
import { create } from 'zustand';
import socketService from './socket';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import supabase from './supabase';

// Get API URL from constants
const API_URL = (Constants.expoConfig?.extra?.BACKEND_URL || 'http://localhost:3000') + '/api';

// Development mode flag
const DEV_MODE = process.env.NODE_ENV === 'development'; // Use actual environment

// Account management store using Zustand
const useAccountStore = create((set, get) => ({
  // Accounts state
  accounts: {
    github: [],
    slack: [],
    gmail: [],
    discord: [],
    zoom: [],
    asana: []
  },
  
  // Loading state
  loading: false,
  
  // Error state
  error: null,
  
  // Get authentication token from Supabase or SecureStore
  getAuthToken: async () => {
    try {
      // First try to get token from Supabase session
      const { data } = await supabase.auth.getSession();
      if (data && data.session) {
        return data.session.access_token;
      }
      
      // Fall back to SecureStore
      const token = await SecureStore.getItemAsync('supabase.auth.token');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },
  
  // Initialize accounts from backend
  initializeAccounts: async () => {
    set({ loading: true, error: null });
    
    try {
      // Get auth token
      const token = await get().getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Use the test endpoint in development mode
      const endpoint = DEV_MODE ? `${API_URL}/test-get-accounts` : `${API_URL}/accounts`;
      console.log('Initializing accounts from API:', endpoint);
      
      // Fetch accounts from the API with auth token
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        console.log('Successfully loaded accounts');
        set({ accounts: response.data.accounts, loading: false });
      } else {
        console.error('API returned error:', response.data.message);
        throw new Error(response.data.message || 'Failed to load accounts');
      }
    } catch (error) {
      console.error('Error initializing accounts:', error);
      
      // Use empty accounts instead of mock data
      console.log('Using empty accounts due to API error');
      const emptyAccounts = {
        github: [],
        slack: [],
        gmail: [],
        discord: [],
        zoom: [],
        asana: []
      };
      
      set({ 
        accounts: emptyAccounts, 
        loading: false,
        error: 'Failed to load accounts from server. Please check your connection and authentication.'
      });
    }
  },
  
  // Add a new account
  addAccount: async (serviceName, accountData) => {
    set({ loading: true, error: null });
    
    try {
      // Get auth token
      const token = await get().getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Use the test endpoint in development mode
      const endpoint = DEV_MODE ? `${API_URL}/test-add-account` : `${API_URL}/accounts`;
      // Call the API to add the account
      const response = await axios.post(endpoint, {
        serviceName,
        accountData
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Refresh accounts to get the updated list
        await get().initializeAccounts();
        return { success: true, account: response.data.account };
      } else {
        throw new Error(response.data.message || 'Failed to add account');
      }
    } catch (error) {
      console.error(`Error adding ${serviceName} account:`, error);
      set({ 
        error: `Failed to add ${serviceName} account: ${error.response?.data?.message || error.message}`, 
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
  
  // Remove an account
  removeAccount: async (serviceName, accountId) => {
    set({ loading: true, error: null });
    
    try {
      // Get auth token
      const token = await get().getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Use the test endpoint in development mode
      const endpoint = DEV_MODE ? `${API_URL}/test-remove-account` : `${API_URL}/accounts/${accountId}`;
      // Call the API to remove the account
      const response = await axios.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Refresh accounts to get the updated list
        await get().initializeAccounts();
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to remove account');
      }
    } catch (error) {
      console.error(`Error removing ${serviceName} account:`, error);
      set({ 
        error: `Failed to remove ${serviceName} account: ${error.response?.data?.message || error.message}`, 
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
  
  // Set an account as active
  setActiveAccount: async (serviceName, accountId) => {
    set({ loading: true, error: null });
    
    try {
      // Get auth token
      const token = await get().getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Use the test endpoint in development mode
      const endpoint = DEV_MODE ? `${API_URL}/test-set-active-account` : `${API_URL}/accounts/${accountId}/active`;
      // Call the API to set the account as active
      const response = await axios.put(endpoint, { serviceName }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Refresh accounts to get the updated list
        await get().initializeAccounts();
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to set active account');
      }
    } catch (error) {
      console.error(`Error setting active ${serviceName} account:`, error);
      set({ 
        error: `Failed to set active ${serviceName} account: ${error.response?.data?.message || error.message}`, 
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
  
  // Authenticate with a service
  authenticateService: async (serviceName) => {
    set({ loading: true, error: null });
    
    try {
      // Get auth token
      const token = await get().getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Use the test endpoint in development mode
      const endpoint = DEV_MODE ? `${API_URL}/test-authenticate-service` : `${API_URL}/accounts/auth/${serviceName}`;
      // Call the API to authenticate with the service
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        set({ loading: false });
        return { success: true, redirectUrl: response.data.redirectUrl };
      } else {
        throw new Error(response.data.message || 'Failed to authenticate service');
      }
    } catch (error) {
      console.error(`Error authenticating with ${serviceName}:`, error);
      set({ 
        error: `Failed to authenticate with ${serviceName}: ${error.response?.data?.message || error.message}`, 
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
  
  // Handle OAuth callback
  handleOAuthCallback: async (serviceName, code) => {
    set({ loading: true, error: null });
    
    try {
      // Get auth token
      const token = await get().getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Use the test endpoint in development mode
      const endpoint = DEV_MODE ? `${API_URL}/test-handle-oauth-callback` : `${API_URL}/accounts/auth/${serviceName}/callback?code=${code}`;
      // Call the API to handle the OAuth callback
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Refresh accounts to get the updated list
        await get().initializeAccounts();
        set({ loading: false });
        return { success: true, account: response.data.account };
      } else {
        throw new Error(response.data.message || 'Failed to handle OAuth callback');
      }
    } catch (error) {
      console.error(`Error handling OAuth callback for ${serviceName}:`, error);
      set({ 
        error: `Failed to handle OAuth callback for ${serviceName}: ${error.response?.data?.message || error.message}`, 
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
  
  // Reset the store
  reset: () => {
    set({
      accounts: {
        github: [],
        slack: [],
        gmail: [],
        discord: [],
        zoom: [],
        asana: []
      },
      loading: false,
      error: null
    });
  }
}));

// Create a wrapper class for backward compatibility
class AccountStore {
  constructor() {
    // Initialize WebSocket connection for real-time updates
    this.initializeWebSocket();
  }
  
  async initializeWebSocket() {
    try {
      // Get the socket instance
      const socket = await socketService.getSocket();
      
      if (socket) {
        // Listen for account updates
        socket.on('account_update', (data) => {
          console.log('Received account update:', data);
          // Update the store with the new account data
          this.refreshAccounts();
        });
        
        // Listen for account refresh success
        socket.on('account:refresh:success', (data) => {
          console.log('Received account refresh success:', data);
          // Update the store with the new account data
          if (data.accounts) {
            useAccountStore.setState({ accounts: data.accounts, loading: false });
          }
        });
        
        // Listen for account status success
        socket.on('account:status:success', (data) => {
          console.log('Received account status success:', data);
          // You can handle this if needed
        });
        
        // Listen for account errors
        socket.on('account:error', (data) => {
          console.error('Received account error:', data);
          useAccountStore.setState({ 
            error: data.message || 'Unknown account error', 
            loading: false 
          });
        });
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket for account updates:', error);
    }
  }
  
  // Request a refresh of accounts via WebSocket
  async requestAccountRefresh() {
    try {
      const socket = await socketService.getSocket();
      if (socket) {
        socket.emit('account:refresh');
      }
    } catch (error) {
      console.error('Failed to request account refresh via WebSocket:', error);
    }
  }
  
  // Check account status for a service via WebSocket
  async checkAccountStatus(serviceName) {
    try {
      const socket = await socketService.getSocket();
      if (socket) {
        socket.emit('account:status', { serviceName });
      }
    } catch (error) {
      console.error(`Failed to check ${serviceName} account status via WebSocket:`, error);
    }
  }
  
  // Initialize accounts
  async initializeAccounts() {
    return useAccountStore.getState().initializeAccounts();
  }
  
  // Get all accounts
  getAccounts() {
    return useAccountStore.getState().accounts;
  }
  
  // Get loading state
  isLoading() {
    return useAccountStore.getState().loading;
  }
  
  // Get error state
  getError() {
    return useAccountStore.getState().error;
  }
  
  // Add a new account
  async addAccount(serviceName, accountData) {
    return useAccountStore.getState().addAccount(serviceName, accountData);
  }
  
  // Remove an account
  async removeAccount(serviceName, accountId) {
    return useAccountStore.getState().removeAccount(serviceName, accountId);
  }
  
  // Set an account as active
  async setActiveAccount(serviceName, accountId) {
    return useAccountStore.getState().setActiveAccount(serviceName, accountId);
  }
  
  // Authenticate with a service
  async authenticateService(serviceName) {
    return useAccountStore.getState().authenticateService(serviceName);
  }
  
  // Handle OAuth callback
  async handleOAuthCallback(serviceName, code) {
    return useAccountStore.getState().handleOAuthCallback(serviceName, code);
  }
  
  // Refresh accounts from the backend
  async refreshAccounts() {
    // Try WebSocket first for real-time updates
    this.requestAccountRefresh();
    
    // Also refresh via API for reliability
    return useAccountStore.getState().initializeAccounts();
  }
  
  // Reset the store
  reset() {
    useAccountStore.getState().reset();
  }
}

// Export singleton instance
const accountStore = new AccountStore();
export default accountStore;

// Also export the hook for components that need direct access to the store
export { useAccountStore };
