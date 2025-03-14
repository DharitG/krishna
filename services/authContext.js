import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import * as supabaseService from './supabase';

// Create the authentication context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Check if user is already logged in
        const currentUser = await supabaseService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          
          // Fetch user profile data
          const userProfile = await supabaseService.getUserProfile(currentUser.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error.message);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Set up auth state listener
  useEffect(() => {
    if (!initialized) return;

    const { data: authListener } = supabaseService.default.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const currentUser = session.user;
          setUser(currentUser);
          
          try {
            // Fetch user profile
            const userProfile = await supabaseService.getUserProfile(currentUser.id);
            setProfile(userProfile);
          } catch (error) {
            console.error('Error fetching user profile:', error.message);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    // Cleanup subscription
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [initialized]);

  // Sign up function
  const signUp = async (email, password, metadata = {}) => {
    setLoading(true);
    try {
      const { data } = await supabaseService.signUp(email, password, metadata);
      Alert.alert(
        'Registration Successful',
        'Please check your email for a confirmation link to complete your registration.'
      );
      return data;
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await supabaseService.signIn(email, password);
      return data;
    } catch (error) {
      Alert.alert('Sign In Error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    try {
      await supabaseService.signOut();
    } catch (error) {
      Alert.alert('Sign Out Error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    setLoading(true);
    try {
      await supabaseService.resetPassword(email);
      Alert.alert(
        'Password Reset Email Sent',
        'Check your email for a link to reset your password.'
      );
    } catch (error) {
      Alert.alert('Password Reset Error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    setLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      
      const updatedProfile = await supabaseService.updateUserProfile(user.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      Alert.alert('Profile Update Error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get service tokens
  const getServiceTokens = async () => {
    try {
      if (!user) throw new Error('User not authenticated');
      return await supabaseService.getServiceTokens(user.id);
    } catch (error) {
      console.error('Error getting service tokens:', error.message);
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    getServiceTokens,
    isAuthenticated: !!user,
  };

  // Render the provider
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;