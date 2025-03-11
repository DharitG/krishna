import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { borderRadius, glassMorphism, shadows } from '../constants/Theme';

const GlassCard = ({ children, style, intensity = 50 }) => {
  // On Android, BlurView doesn't work as well, so we use a semi-transparent background
  if (Platform.OS === 'android') {
    return (
      <View style={[styles.container, styles.androidContainer, style]}>
        {children}
      </View>
    );
  }

  // On iOS, we can use the BlurView for a true glass effect
  return (
    <BlurView intensity={intensity} style={[styles.container, style]}>
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...shadows.sm,
  },
  androidContainer: {
    backgroundColor: 'rgba(30, 30, 34, 0.75)',
  }
});

export default GlassCard;