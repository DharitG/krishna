import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as supabaseService from './supabase';
import revenueCatService from './revenueCatService';

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
  const [subscription, setSubscription] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Initialize RevenueCat
        await revenueCatService.initializeRevenueCat();
        
        // Check if user is already logged in
        const currentUser = await supabaseService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          
          // Fetch user profile data
          const userProfile = await supabaseService.getUserProfile(currentUser.id);
          setProfile(userProfile);
          
          // Identify user with RevenueCat
          await revenueCatService.identifyUser(currentUser.id);
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
            
            // Identify user with RevenueCat
            await revenueCatService.identifyUser(currentUser.id);
            
            // Fetch user subscription
            await fetchSubscriptionStatus(currentUser.id);
          } catch (error) {
            console.error('Error fetching user profile:', error.message);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setSubscription(null);
          
          // Reset RevenueCat user
          await revenueCatService.resetUser();
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
  
  // Fetch subscription status
  const fetchSubscriptionStatus = async (userId) => {
    try {
      // Get subscription from Supabase
      const userSubscription = await supabaseService.getUserSubscription(userId);
      
      // Get subscription status from RevenueCat
      const rcStatus = await revenueCatService.getCurrentSubscriptionStatus();
      
      // Combine data and set subscription state
      setSubscription({
        ...userSubscription,
        rcStatus: rcStatus
      });
      
      return userSubscription;
    } catch (error) {
      console.error('Error fetching subscription status:', error.message);
      return null;
    }
  };

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

  // Subscribe to a plan
  const subscribeToPlan = async (packageToPurchase) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Purchase package through RevenueCat
      const customerInfo = await revenueCatService.purchasePackage(packageToPurchase, user.id);
      
      // Refresh subscription status
      await fetchSubscriptionStatus(user.id);
      
      return customerInfo;
    } catch (error) {
      if (!error.userCancelled) {
        Alert.alert('Subscription Error', error.message);
      }
      throw error;
    }
  };
  
  // Restore purchases
  const restorePurchases = async () => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Restore purchases through RevenueCat
      const customerInfo = await revenueCatService.restorePurchases(user.id);
      
      // Refresh subscription status
      await fetchSubscriptionStatus(user.id);
      
      return customerInfo;
    } catch (error) {
      Alert.alert('Restore Purchases Error', error.message);
      throw error;
    }
  };
  
  // Get current plan name
  const getCurrentPlan = () => {
    if (!subscription) return 'free';
    
    // Check RC status first
    if (subscription.rcStatus?.customerInfo) {
      return revenueCatService.getCurrentPlan(subscription.rcStatus.customerInfo);
    }
    
    // Fall back to database status
    if (subscription.status === 'active' && subscription.plan_id) {
      if (subscription.plan_id.includes('utopia')) return 'utopia';
      if (subscription.plan_id.includes('eden')) return 'eden';
    }
    
    return 'free';
  };
  
  // Check if user has access to specific feature
  const hasFeatureAccess = (featureName) => {
    const currentPlan = getCurrentPlan();
    
    // Add your feature access logic here based on plan
    switch (featureName) {
      case 'unlimited_requests':
        return currentPlan === 'utopia';
      case 'file_uploads':
        return currentPlan === 'utopia';
      case 'priority_support':
        return currentPlan === 'utopia';
      case 'basic_ai':
        return currentPlan === 'eden' || currentPlan === 'utopia';
      default:
        return false;
    }
  };

  // Context value
  const value = {
    user,
    profile,
    subscription,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    getServiceTokens,
    isAuthenticated: !!user,
    subscribeToPlan,
    restorePurchases,
    getCurrentPlan,
    hasFeatureAccess,
    fetchSubscriptionStatus
  };

  // Render the provider
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;