import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, borderRadius, shadows, glassMorphism } from '../../constants/Theme';

const Card = ({
  variant = 'default',
  glass = false,
  onPress,
  style,
  children,
  ...props
}) => {
  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    glass && styles.glass,
    style
  ];

  const Component = onPress ? Pressable : View;

  return (
    <Component
      style={cardStyle}
      onPress={onPress}
      {...props}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.card.default,
    padding: spacing.card.padding,
    margin: spacing.card.margin,
    ...shadows.card.default
  },
  elevated: {
    ...shadows.card.elevated
  },
  glass: {
    ...glassMorphism.light
  }
});

export default Card; 