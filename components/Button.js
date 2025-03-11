import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  colors, 
  borderRadius, 
  spacing,
  shadows,
  typography
} from '../constants/Theme';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', // primary, ghost, subtle
  size = 'md', // sm, md, lg
  disabled = false,
  isLoading = false,
  icon = null,
  style,
  textStyle
}) => {
  // Determine button style based on variant
  const getButtonContent = () => {
    if (isLoading) {
      return <ActivityIndicator color={variant === 'primary' ? colors.white : colors.emerald} />;
    }

    return (
      <View style={styles.contentContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[
          styles.text,
          styles[`${size}Text`],
          variant !== 'primary' && styles.textAlternate,
          disabled && styles.textDisabled,
          textStyle
        ]}>
          {title}
        </Text>
      </View>
    );
  };

  // Render different button types
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        style={[styles.buttonBase, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={disabled ? [colors.lightGray, colors.lightGray] : colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            styles[`${size}Button`],
            disabled && styles.disabled
          ]}
        >
          {getButtonContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Ghost or Subtle button
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.buttonBase,
        styles[`${size}Button`],
        variant === 'ghost' && styles.ghostButton,
        variant === 'subtle' && styles.subtleButton,
        disabled && styles.ghostDisabled,
        style
      ]}
      activeOpacity={0.6}
    >
      {getButtonContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.emerald,
  },
  subtleButton: {
    backgroundColor: 'transparent',
  },
  smButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 34,
  },
  mdButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    height: 44,
    ...shadows.sm,
  },
  lgButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    height: 54,
    ...shadows.md,
  },
  disabled: {
    opacity: 0.5,
  },
  ghostDisabled: {
    borderColor: colors.lightGray,
    opacity: 0.5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  text: {
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  textAlternate: {
    color: colors.emerald,
  },
  textDisabled: {
    color: colors.lightGray,
  },
  smText: {
    fontSize: typography.fontSize.sm,
  },
  mdText: {
    fontSize: typography.fontSize.md,
  },
  lgText: {
    fontSize: typography.fontSize.lg,
  },
});

export default Button;