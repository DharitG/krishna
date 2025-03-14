import React from 'react';
import { 
  TextInput, 
  View, 
  StyleSheet, 
  Text,
  Pressable 
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/Theme';

const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputContainer,
        error && styles.inputError
      ]}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle
          ]}
          placeholderTextColor={colors.text.tertiary}
          {...props}
        />
        {rightIcon && (
          <Pressable 
            style={styles.iconContainer}
            onPress={onRightIconPress}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.input,
    borderRadius: borderRadius.input.default,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  inputError: {
    borderColor: colors.border.error,
  },
  input: {
    flex: 1,
    ...typography.body.medium,
    color: colors.text.primary,
    padding: spacing.input.padding,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: spacing.sm,
  },
  iconContainer: {
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body.small,
    color: colors.text.error,
    marginTop: spacing.xs,
  }
});

export default Input; 