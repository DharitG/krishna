import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as themeColors } from '../constants/Theme';

const GradientBackground = ({ 
  children, 
  style, 
  colors = themeColors.gradients.primary,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 }
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default GradientBackground;