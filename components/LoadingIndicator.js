import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/Theme';

const LoadingIndicator = ({ size = 'large', color = colors.info }) => {
  // Create animated values for each dot
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;
  
  // Create animated values for dot scale
  const dot1Scale = useRef(new Animated.Value(1)).current;
  const dot2Scale = useRef(new Animated.Value(1)).current;
  const dot3Scale = useRef(new Animated.Value(1)).current;

  // Determine dot size based on the size prop
  const dotSize = size === 'large' ? 10 : size === 'medium' ? 8 : 6;
  const dotSpacing = size === 'large' ? 6 : size === 'medium' ? 5 : 4;

  useEffect(() => {
    // Create animation sequence
    const animateDots = () => {
      // Reset values
      dot1Opacity.setValue(0.3);
      dot2Opacity.setValue(0.3);
      dot3Opacity.setValue(0.3);
      dot1Scale.setValue(1);
      dot2Scale.setValue(1);
      dot3Scale.setValue(1);

      // Create animation sequence
      Animated.sequence([
        // First dot
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot1Scale, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Second dot
        Animated.parallel([
          Animated.timing(dot2Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Scale, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Third dot
        Animated.parallel([
          Animated.timing(dot3Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Scale, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Loop animation
        animateDots();
      });
    };

    // Start animation
    animateDots();

    // Cleanup
    return () => {
      dot1Opacity.stopAnimation();
      dot2Opacity.stopAnimation();
      dot3Opacity.stopAnimation();
      dot1Scale.stopAnimation();
      dot2Scale.stopAnimation();
      dot3Scale.stopAnimation();
    };
  }, [dot1Opacity, dot2Opacity, dot3Opacity, dot1Scale, dot2Scale, dot3Scale]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            marginHorizontal: dotSpacing,
            backgroundColor: color,
            opacity: dot1Opacity,
            transform: [{ scale: dot1Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            marginHorizontal: dotSpacing,
            backgroundColor: color,
            opacity: dot2Opacity,
            transform: [{ scale: dot2Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            marginHorizontal: dotSpacing,
            backgroundColor: color,
            opacity: dot3Opacity,
            transform: [{ scale: dot3Scale }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: colors.info,
  },
});

export default LoadingIndicator;
