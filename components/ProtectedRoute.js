import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../services/authContext';
import { colors } from '../constants/Theme';

/**
 * Component to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    
    if (!isAuthenticated && !inAuthGroup) {
      // If user is not authenticated and not on an auth page, redirect to login
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // If user is authenticated and on an auth page, redirect to home
      router.replace('/');
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.emerald} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
});