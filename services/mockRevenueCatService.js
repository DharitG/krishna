// Mock service for development when native RevenueCat module isn't available
import { Platform } from 'react-native';

// Mock offering data
const mockOfferings = {
  current: {
    identifier: 'default',
    availablePackages: [
      {
        identifier: 'monthly',
        product: {
          identifier: 'nirvana_monthly',
          title: 'Nirvana Monthly',
          description: 'Affordable plan with essential features',
          price: 10,
          priceString: '$10',
        }
      },
      {
        identifier: 'monthly',
        product: {
          identifier: 'eden_monthly',
          title: 'Eden Monthly',
          description: 'Enhanced access with more features',
          price: 20,
          priceString: '$20',
        }
      },
      {
        identifier: 'monthly',
        product: {
          identifier: 'utopia_monthly',
          title: 'Utopia Monthly',
          description: 'Premium access with all features',
          price: 50,
          priceString: '$50',
        }
      }
    ]
  }
};

// Mock customer info
const mockCustomerInfo = {
  entitlements: {
    active: {}
  },
  originalAppUserId: 'mock-user-id',
};

/**
 * Initialize RevenueCat with the appropriate API key
 */
export const initializeRevenueCat = async () => {
  console.log('[MOCK] RevenueCat initialized successfully');
  return true;
};

/**
 * Identify the user with RevenueCat
 * Call this when user logs in or account status changes
 */
export const identifyUser = async (userId) => {
  console.log('[MOCK] User identified with RevenueCat:', userId);
  return true;
};

/**
 * Reset user identification when logging out
 */
export const resetUser = async () => {
  console.log('[MOCK] User logged out from RevenueCat');
  return true;
};

/**
 * Get available offerings from RevenueCat
 */
export const getOfferings = async () => {
  console.log('[MOCK] Getting offerings');
  return mockOfferings;
};

/**
 * Purchase a subscription package
 */
export const purchasePackage = async (packageToPurchase, userId) => {
  console.log('[MOCK] Purchasing package:', packageToPurchase.product.identifier);
  
  // Simulate purchase success
  let mockEntitlementId;
  if (packageToPurchase.product.identifier.includes('nirvana')) {
    mockEntitlementId = 'nirvana_access';
  } else if (packageToPurchase.product.identifier.includes('eden')) {
    mockEntitlementId = 'eden_access';
  } else {
    mockEntitlementId = 'utopia_access';
  }
  
  const mockInfo = {
    ...mockCustomerInfo,
    entitlements: {
      active: {
        [mockEntitlementId]: {
          identifier: mockEntitlementId,
          productIdentifier: packageToPurchase.product.identifier,
          expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days later
          purchaseDate: new Date().toISOString(),
        }
      }
    }
  };
  
  return mockInfo;
};

/**
 * Get current subscription status for the user
 */
export const getCurrentSubscriptionStatus = async () => {
  console.log('[MOCK] Getting subscription status');
  return {
    hasActiveSubscription: false,
    entitlements: {},
    customerInfo: mockCustomerInfo,
  };
};

/**
 * Check if user has an active subscription
 */
export const hasActiveSubscription = (customerInfo) => {
  return Object.keys(customerInfo?.entitlements?.active || {}).length > 0;
};

/**
 * Get user's current plan based on entitlements
 */
export const getCurrentPlan = (customerInfo) => {
  if (!customerInfo?.entitlements?.active) return 'free';
  
  if (customerInfo.entitlements.active['utopia_access']) {
    return 'utopia';
  } else if (customerInfo.entitlements.active['eden_access']) {
    return 'eden';
  } else if (customerInfo.entitlements.active['nirvana_access']) {
    return 'nirvana';
  }
  
  return 'free';
};

/**
 * Restore purchases for the current user
 */
export const restorePurchases = async (userId) => {
  console.log('[MOCK] Restoring purchases for user:', userId);
  return mockCustomerInfo;
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

// Plan IDs mapping
const PLAN_IDS = {
  nirvana: {
    monthly: Platform.select({
      ios: 'nirvana_monthly_ios',
      android: 'nirvana_monthly_android',
      default: 'nirvana_monthly',
    }),
  },
  eden: {
    monthly: Platform.select({
      ios: 'eden_monthly_ios',
      android: 'eden_monthly_android',
      default: 'eden_monthly',
    }),
  },
  utopia: {
    monthly: Platform.select({
      ios: 'utopia_monthly_ios',
      android: 'utopia_monthly_android',
      default: 'utopia_monthly',
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