import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Determine if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Dynamic import based on environment
let service;

// Use mock service in Expo Go, use real service in development or production builds
try {
  if (isExpoGo) {
    service = require('./mockRevenueCatService').default;
    console.log('Using mock RevenueCat service for Expo Go');
  } else {
    service = require('./revenueCatService').default;
    console.log('Using real RevenueCat service');
  }
} catch (error) {
  console.warn('Error loading subscription service:', error);
  // Fallback to mock service if real service fails to load
  service = require('./mockRevenueCatService').default;
  console.log('Falling back to mock RevenueCat service');
}

export default service;