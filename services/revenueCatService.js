import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { useAuth } from './authContext';
import * as supabaseService from './supabase';
import Constants from 'expo-constants';

// Get RevenueCat API keys from environment variables
const REVENUECAT_API_KEYS = {
  ios: Constants.expoConfig?.extra?.REVENUECAT_IOS_API_KEY,
  android: Constants.expoConfig?.extra?.REVENUECAT_ANDROID_API_KEY,
};

// Plan IDs mapping - define product IDs exactly as they are in RevenueCat dashboard
const PLAN_IDS = {
  nirvana: {
    monthly: Platform.select({
      ios: 'nirvana_monthly_ios',
      android: 'nirvana_monthly_android',
    }),
  },
  eden: {
    monthly: Platform.select({
      ios: 'eden_monthly_ios',
      android: 'eden_monthly_android',
    }),
  },
  utopia: {
    monthly: Platform.select({
      ios: 'utopia_monthly_ios',
      android: 'utopia_monthly_android',
    }),
  },
};

// Plan entitlement IDs 
const ENTITLEMENTS = {
  nirvana: 'nirvana_access',
  eden: 'eden_access',
  utopia: 'utopia_access',
};

// Offering identifiers
const OFFERINGS = {
  main: 'default',
};

/**
 * Initialize RevenueCat with the appropriate API key
 */
export const initializeRevenueCat = async () => {
  try {
    const apiKey = Platform.select(REVENUECAT_API_KEYS);
    if (!apiKey) {
      throw new Error('RevenueCat API key not configured for this platform');
    }

    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG); // Set to INFO or VERBOSE in production
    await Purchases.configure({ apiKey });
    console.log('RevenueCat initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    return false;
  }
};

/**
 * Identify the user with RevenueCat
 * Call this when user logs in or account status changes
 */
export const identifyUser = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to identify user with RevenueCat');
    }
    
    await Purchases.logIn(userId);
    console.log('User identified with RevenueCat:', userId);
    return true;
  } catch (error) {
    console.error('Failed to identify user with RevenueCat:', error);
    return false;
  }
};

/**
 * Reset user identification when logging out
 */
export const resetUser = async () => {
  try {
    await Purchases.logOut();
    console.log('User logged out from RevenueCat');
    return true;
  } catch (error) {
    console.error('Failed to log out user from RevenueCat:', error);
    return false;
  }
};

/**
 * Get available offerings from RevenueCat
 */
export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    throw error;
  }
};

/**
 * Purchase a subscription package
 */
export const purchasePackage = async (packageToPurchase, userId) => {
  try {
    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);
    
    // Store purchase information in your backend
    if (customerInfo.entitlements.active) {
      await savePurchaseToBackend(userId, customerInfo, productIdentifier);
    }
    
    return customerInfo;
  } catch (error) {
    if (!error.userCancelled) {
      console.error('Purchase error:', error);
    }
    throw error;
  }
};

/**
 * Get current subscription status for the user
 */
export const getCurrentSubscriptionStatus = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return {
      hasActiveSubscription: hasActiveSubscription(customerInfo),
      entitlements: customerInfo.entitlements.active,
      customerInfo,
    };
  } catch (error) {
    console.error('Failed to get subscription status:', error);
    throw error;
  }
};

/**
 * Check if user has an active subscription
 */
export const hasActiveSubscription = (customerInfo) => {
  return (
    !!customerInfo?.entitlements?.active?.[ENTITLEMENTS.nirvana] ||
    !!customerInfo?.entitlements?.active?.[ENTITLEMENTS.eden] ||
    !!customerInfo?.entitlements?.active?.[ENTITLEMENTS.utopia]
  );
};

/**
 * Get user's current plan based on entitlements
 */
export const getCurrentPlan = (customerInfo) => {
  if (!customerInfo?.entitlements?.active) return 'free';
  
  if (customerInfo.entitlements.active[ENTITLEMENTS.utopia]) {
    return 'utopia';
  } else if (customerInfo.entitlements.active[ENTITLEMENTS.eden]) {
    return 'eden';
  } else if (customerInfo.entitlements.active[ENTITLEMENTS.nirvana]) {
    return 'nirvana';
  }
  
  return 'free';
};

/**
 * Save purchase information to your backend
 */
const savePurchaseToBackend = async (userId, customerInfo, productIdentifier) => {
  try {
    // Determine plan from product identifier
    let planId = '';
    if (productIdentifier.includes('nirvana')) {
      planId = 'nirvana_monthly';
    } else if (productIdentifier.includes('eden')) {
      planId = 'eden_monthly';
    } else if (productIdentifier.includes('utopia')) {
      planId = 'utopia_monthly';
    }

    // Get active subscription info
    const subscriptionInfo = Object.values(customerInfo.entitlements.active)[0];
    if (!subscriptionInfo) return;

    const platform = Platform.OS;
    const expirationDate = new Date(subscriptionInfo.expirationDate);
    const purchaseDate = new Date(subscriptionInfo.purchaseDate);
    
    // Save subscription to Supabase
    const subscriptionData = {
      user_id: userId,
      plan_id: planId,
      revenuecat_customer_id: customerInfo.originalAppUserId,
      revenuecat_entitlement_id: subscriptionInfo.identifier,
      status: 'active',
      platform,
      original_purchase_date: purchaseDate.toISOString(),
      expires_date: expirationDate.toISOString(),
      renewal_date: expirationDate.toISOString(),
      is_trial: false
    };

    await supabaseService.saveSubscription(subscriptionData);
    
    // Save purchase history
    const purchaseData = {
      user_id: userId,
      transaction_id: subscriptionInfo.productIdentifier,
      platform,
      product_id: productIdentifier,
      purchase_date: purchaseDate.toISOString(),
      amount_usd: planId.includes('nirvana') ? 10.00 : (planId.includes('eden') ? 20.00 : 50.00),
    };
    
    await supabaseService.savePurchaseHistory(purchaseData);
    
  } catch (error) {
    console.error('Failed to save purchase to backend:', error);
  }
};

/**
 * Restore purchases for the current user
 */
export const restorePurchases = async (userId) => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    
    if (hasActiveSubscription(customerInfo)) {
      // Update the backend with the restored subscription
      await savePurchaseToBackend(userId, customerInfo, 
        Object.values(customerInfo.entitlements.active)[0]?.productIdentifier || '');
    }
    
    return customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
};

/**
 * Format offerings for display in the UI
 */
export const formatOfferings = (offerings) => {
  if (!offerings || !offerings.current) return [];
  
  const packages = offerings.current.availablePackages;
  return packages.map(pkg => ({
    identifier: pkg.identifier,
    title: pkg.product.title,
    description: pkg.product.description,
    price: pkg.product.price,
    priceString: pkg.product.priceString,
    period: getPeriodFromIdentifier(pkg.identifier),
    productIdentifier: pkg.product.identifier,
  }));
};

/**
 * Helper to determine billing period from package identifier
 */
const getPeriodFromIdentifier = (identifier) => {
  if (identifier.includes('monthly')) return 'monthly';
  if (identifier.includes('yearly')) return 'yearly';
  if (identifier.includes('weekly')) return 'weekly';
  return 'unknown';
};

export default {
  initializeRevenueCat,
  identifyUser,
  resetUser,
  getOfferings,
  purchasePackage,
  getCurrentSubscriptionStatus,
  hasActiveSubscription,
  getCurrentPlan,
  restorePurchases,
  formatOfferings,
  PLAN_IDS,
  ENTITLEMENTS,
  OFFERINGS
};