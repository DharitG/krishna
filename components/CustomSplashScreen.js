import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

const CustomSplashScreen = ({ onAnimationComplete }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.sequence([
      // Wait a bit before starting animation
      Animated.delay(300),
      // Run fade in and scale up animations in parallel
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      // Hold the splash screen for a moment
      Animated.delay(500),
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Notify parent that animation is complete
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, [fadeAnim, scaleAnim, onAnimationComplete]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../assets/images/august.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10,
    width: width,
    height: height,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

export default CustomSplashScreen;
