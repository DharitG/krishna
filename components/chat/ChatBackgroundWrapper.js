import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, animation } from '../../constants/Theme';

export default function ChatBackgroundWrapper({ children }) {
  const glowOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const pulseGlow = () => {
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.8,
          duration: animation.duration.slow,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.6,
          duration: animation.duration.slow,
          useNativeDriver: true,
        })
      ]).start(() => pulseGlow());
    };

    pulseGlow();
  }, []);

  return (
    <LinearGradient
      colors={colors.gradients.chat}
      locations={[0, 0.4, 0.8, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <Animated.View 
        style={[
          styles.glowOverlay,
          { opacity: glowOpacity }
        ]}
      />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    position: 'relative',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(48, 109, 255, 0.05)',
  },
});
