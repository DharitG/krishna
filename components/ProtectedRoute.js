import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../services/authContext';
import { colors, animation } from '../constants/Theme';

/**
 * Component to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    // Fade in animation when component mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: animation.slow,
      useNativeDriver: true,
    }).start();

    return () => {
      // Fade out animation when component unmounts
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: animation.fast,
        useNativeDriver: true,
      }).start();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.emerald} />
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
});