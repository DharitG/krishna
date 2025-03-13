import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography
} from '../../constants/Theme';

const serviceConfig = {
  gmail: {
    name: 'Gmail',
    icon: 'mail',
    color: colors.error,
  },
  github: {
    name: 'GitHub',
    icon: 'logo-github',
    color: '#333',
  },
  slack: {
    name: 'Slack',
    icon: 'logo-slack',
    color: '#4A154B',
  },
  // Add more services as needed
};

const AuthButton = ({ 
  service, 
  onPress, 
  isLoading = false,
  isAuthenticated = false,
  disabled = false
}) => {
  const config = serviceConfig[service.toLowerCase()] || {
    name: service,
    icon: 'link',
    color: colors.emerald,
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { backgroundColor: isAuthenticated ? colors.success : config.color },
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={isLoading || disabled || isAuthenticated}
    >
      <View style={styles.content}>
        <Ionicons name={isAuthenticated ? 'checkmark-circle' : config.icon} size={24} color="white" />
        <Text style={styles.text}>
          {isAuthenticated 
            ? `Connected to ${config.name}` 
            : isLoading 
              ? `Connecting to ${config.name}...` 
              : `Connect to ${config.name}`}
        </Text>
        {isLoading && (
          <ActivityIndicator 
            size="small" 
            color="white" 
            style={styles.loader} 
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    marginLeft: spacing.md,
  },
  loader: {
    marginLeft: spacing.md,
  },
  disabled: {
    opacity: 0.6,
  }
});

export default AuthButton;