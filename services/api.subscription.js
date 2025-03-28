import axios from 'axios';
import Constants from 'expo-constants';
import { getAuthToken } from './supabase';

// Get backend URL from environment variables
const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://localhost:3000';

/**
 * Get user's subscription status from the backend
 * @returns {Promise<Object>} Subscription status
 */
export const getSubscriptionStatus = async () => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    // Make API request to get subscription status
    const response = await axios.get(`${BACKEND_URL}/api/subscription/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    
    // Return default status on error
    return {
      success: false,
      error: error.message,
      subscription: null,
      rateLimit: {
        plan: 'free',
        isAllowed: true,
        limit: 10,
        remaining: 10
      }
    };
  }
};

/**
 * Get user's purchase history from the backend
 * @returns {Promise<Object>} Purchase history
 */
export const getPurchaseHistory = async () => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    // Make API request to get purchase history
    const response = await axios.get(`${BACKEND_URL}/api/subscription/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting purchase history:', error);
    
    // Return empty history on error
    return {
      success: false,
      error: error.message,
      purchases: []
    };
  }
};

/**
 * Get available subscription plans from the backend
 * @returns {Promise<Object>} Subscription plans
 */
export const getSubscriptionPlans = async () => {
  try {
    // This endpoint doesn't require authentication
    const response = await axios.get(`${BACKEND_URL}/api/subscription/plans`);
    
    return response.data;
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    
    // Return default plans on error
    return {
      success: false,
      error: error.message,
      plans: [
        {
          id: 'free',
          name: 'Free',
          description: 'Basic access with limited features',
          price: 0,
          features: [
            '10 requests per day',
            'Basic AI features',
            'Standard support'
          ]
        },
        {
          id: 'eden',
          name: 'Eden',
          description: 'Enhanced access with more features',
          price: 9.99,
          features: [
            '100 requests per day',
            'Advanced AI features',
            'Email support',
            'File uploads'
          ]
        },
        {
          id: 'utopia',
          name: 'Utopia',
          description: 'Premium access with all features',
          price: 19.99,
          features: [
            'Unlimited requests',
            'All AI features',
            'Priority support',
            'Unlimited file uploads',
            'Custom integrations'
          ]
        }
      ]
    };
  }
};

/**
 * Reset user's rate limit cache
 * @returns {Promise<Object>} Reset result
 */
export const resetRateLimitCache = async () => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    // Make API request to reset rate limit cache
    const response = await axios.post(`${BACKEND_URL}/api/subscription/reset-limit`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error resetting rate limit cache:', error);
    
    // Return error
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  getSubscriptionStatus,
  getPurchaseHistory,
  getSubscriptionPlans,
  resetRateLimitCache
};
