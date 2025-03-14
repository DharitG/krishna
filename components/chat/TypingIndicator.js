import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../constants/Theme';
import GlassCard from '../GlassCard';

const TypingIndicator = () => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  useEffect(() => {
    const animateDots = () => {
      // Reset values
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);

      // Create staggered animation sequence
      Animated.sequence([
        // First dot
        Animated.timing(dot1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Second dot
        Animated.timing(dot2, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Third dot
        Animated.timing(dot3, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Brief pause at the end
        Animated.delay(300),
      ]).start(() => {
        // Repeat animation
        animateDots();
      });
    };

    // Start animation
    animateDots();

    // Cleanup
    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      <GlassCard style={styles.bubbleContainer}>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
                transform: [
                  {
                    translateY: dot1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
                transform: [
                  {
                    translateY: dot2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
                transform: [
                  {
                    translateY: dot3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  bubbleContainer: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomLeftRadius: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.5)',
    ...shadows.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.emerald,
    marginHorizontal: 3,
  },
});

export default TypingIndicator;