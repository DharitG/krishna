import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Get Supabase URL and anon key from environment variables
const {
  SUPABASE_URL = 'your-supabase-url',
  SUPABASE_ANON_KEY = 'your-supabase-anon-key',
} = Constants.expoConfig?.extra || {};

// Create a custom storage adapter using expo-secure-store
const secureStorageAdapter = {
  getItem: async (key) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: secureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Sign up a new user with email and password
 * @param {String} email - User's email
 * @param {String} password - User's password
 * @param {Object} metadata - Additional user data
 * @returns {Object} - Sign up result
 */
export const signUp = async (email, password, metadata = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // Custom user metadata
      },
    });

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }
};

/**
 * Sign in a user with email and password
 * @param {String} email - User's email
 * @param {String} password - User's password
 * @returns {Object} - Sign in result
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Object} - Sign out result
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};

/**
 * Reset password for a user
 * @param {String} email - User's email
 * @returns {Object} - Password reset result
 */
export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'august://reset-password',
    });

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error resetting password:', error.message);
    throw error;
  }
};

/**
 * Update the current user's password
 * @param {String} password - New password
 * @returns {Object} - Update result
 */
export const updatePassword = async (password) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error updating password:', error.message);
    throw error;
  }
};

/**
 * Get the current user session
 * @returns {Object|null} - Current session or null if not authenticated
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
};

/**
 * Get the current user
 * @returns {Object|null} - Current user or null if not authenticated
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error getting user:', error.message);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {Boolean} - True if authenticated, false otherwise
 */
export const isAuthenticated = async () => {
  const session = await getCurrentSession();
  return session !== null;
};

/**
 * Get user profile data
 * @param {String} userId - User ID
 * @returns {Object} - User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error.message);
    throw error;
  }
};

/**
 * Update user profile data
 * @param {String} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Object} - Updated profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    throw error;
  }
};

/**
 * Get service tokens for the current user
 * @param {String} userId - User ID
 * @returns {Array} - Array of service tokens
 */
export const getServiceTokens = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('service_tokens')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting service tokens:', error.message);
    throw error;
  }
};

// Export the Supabase client for direct access if needed
export default supabase;