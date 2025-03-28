import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing } from '../../constants/Theme';

const WelcomeMessage = ({ userName }) => {
  const opacity = new Animated.Value(0);
  
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.greeting}>
        {getGreeting()},
      </Text>
      <Text style={styles.name}>
        {userName || 'Dharit'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  greeting: {
    color: colors.text.primary,
    fontSize: 44,
    fontFamily: typography.fontFamily.light,
    marginBottom: spacing.xs,
    letterSpacing: 0.4,
  },
  name: {
    color: colors.text.primary,
    fontSize: 44,
    fontFamily: typography.fontFamily.medium,
    letterSpacing: 0.4,
  },
});

export default WelcomeMessage;
