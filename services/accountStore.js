import Constants from 'expo-constants';
import { create } from 'zustand';
import socketService from './socket';
import axios from 'axios';

// Get API URL from constants
const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:3000/api';

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
  
  // Initialize accounts from backend
  initializeAccounts: async () => {
    set({ loading: true, error: null });
    
    try {
      // Fetch accounts from the API
      const response = await axios.get(`${API_URL}/accounts`);
      
      if (response.data.success) {
        set({ accounts: response.data.accounts, loading: false });
      } else {
        throw new Error(response.data.message || 'Failed to load accounts');
      }
    } catch (error) {
      console.error('Error initializing accounts:', error);
      
      // Fallback to mock data if API fails
      const mockAccounts = {
        github: [
          { id: 'gh1', username: 'user1', email: 'user1@github.com', isActive: true },
          { id: 'gh2', username: 'user2', email: 'user2@github.com', isActive: false }
        ],
        slack: [
          { id: 'sl1', username: 'user1', workspace: 'Workspace 1', isActive: true }
        ],
        gmail: [
          { id: 'gm1', email: 'user@gmail.com', isActive: true }
        ],
        discord: [],
        zoom: [],
        asana: []
      };
      
      set({ 
        accounts: mockAccounts, 
        loading: false,
        error: 'Failed to load accounts from server. Using mock data.'
      });
    }
  },
  
  // Add a new account
  addAccount: async (serviceName, accountData) => {
    set({ loading: true, error: null });
    
    try {
      // Call the API to add the account
      const response = await axios.post(`${API_URL}/accounts`, {
        serviceName,
        accountData
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
      // Call the API to remove the account
      const response = await axios.delete(`${API_URL}/accounts/${accountId}`);
      
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
      // Call the API to set the account as active
      const response = await axios.put(`${API_URL}/accounts/${accountId}/active`);
      
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
      // Call the API to initiate OAuth
      const response = await axios.get(`${API_URL}/accounts/auth/${serviceName}`);
      
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
      // Call the API to handle the OAuth callback
      const response = await axios.get(`${API_URL}/accounts/auth/${serviceName}/callback?code=${code}`);
      
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
