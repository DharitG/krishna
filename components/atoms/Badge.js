import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/Theme';
import Text from './Text';

const Badge = ({
  label,
  variant = 'default', // default, success, warning, error, info
  size = 'md', // sm, md, lg
  style,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: colors.success + '20',
          borderColor: colors.success,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning + '20',
          borderColor: colors.warning,
        };
      case 'error':
        return {
          backgroundColor: colors.error + '20',
          borderColor: colors.error,
        };
      case 'info':
        return {
          backgroundColor: colors.info + '20',
          borderColor: colors.info,
        };
      default:
        return {
          backgroundColor: colors.background.tertiary,
          borderColor: colors.border.primary,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
        };
      case 'lg':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
        };
      default:
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
        };
    }
  };

  return (
    <View
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        style
      ]}
      {...props}
    >
      <Text
        variant={`body.${size === 'lg' ? 'medium' : 'small'}`}
        color={`text.${variant === 'default' ? 'secondary' : variant}`}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.round,
    borderWidth: 1,
  }
});

export default Badge; 