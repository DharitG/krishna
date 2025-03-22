import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../constants/NewTheme';

const { width } = Dimensions.get('window');

const DynamicAuthBlob = ({
  service = 'default',
  onAuthenticate,
  isLoading = false,
  isConnected = false,
  error = '',
  onErrorDismiss,
  size = 'default'
}) => {
  const [isPulsing, setIsPulsing] = useState(false);

  const serviceConfig = {
    github: {
      title: 'GitHub',
      icon: 'github',
      description: 'Access repository details, issues, and PRs'
    },
    gmail: {
      title: 'Gmail',
      icon: 'mail',
      description: 'Read and send emails on your behalf'
    },
    slack: {
      title: 'Slack',
      icon: 'slack',
      description: 'Send messages and access channels'
    },
    calendar: {
      title: 'Calendar',
      icon: 'calendar',
      description: 'View and create calendar events'
    },
    dropbox: {
      title: 'Dropbox',
      icon: 'dropbox',
      description: 'Access your Dropbox files and folders'
    },
    asana: {
      title: 'Asana',
      icon: 'check-square',
      description: 'Access tasks and projects'
    },
    default: {
      title: 'Connect',
      icon: 'link',
      description: 'Connect to an external service'
    }
  };

  useEffect(() => {
    if (isLoading) {
      setIsPulsing(true);
    } else {
      setIsPulsing(false);
    }
  }, [isLoading]);

  const config = serviceConfig[service] || serviceConfig.default;
  const gradientColors = theme.colors.gradients[service] || theme.colors.gradients.default;
  const blobSize = size === 'large' ? width * 0.9 : width * 0.7;

  const handlePress = () => {
    if (isLoading || isConnected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAuthenticate(service);
  };

  return (
    <View style={[styles.container, { width: blobSize }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor: theme.colors.border,
          },
          isPulsing && styles.pulsing
        ]}>
        {/* Glow Effect */}
        <View style={[
          styles.glow,
          {
            backgroundColor: gradientColors[1],
          }
        ]} />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Feather name={config.icon} size={24} color={theme.colors.text.primary} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{config.title}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>{config.description}</Text>

          {/* Error message */}
          {error ? (
            <View style={styles.errorContainer}>
              <View style={styles.errorContent}>
                <Feather name="alert-circle" size={16} color="#FF4D4F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
              <TouchableOpacity
                onPress={onErrorDismiss}
                style={styles.tryAgainButton}
              >
                <Text style={styles.tryAgainText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Connect button */}
          <TouchableOpacity
            onPress={handlePress}
            disabled={isLoading || isConnected}
            style={[
              styles.button,
              isConnected && styles.connectedButton,
              isLoading && styles.loadingButton
            ]}
          >
            <Text style={styles.buttonText}>
              {isConnected ? 'Connected' : isLoading ? 'Connecting...' : 'Connect'}
            </Text>
            {isConnected && (
              <Feather
                name="check"
                size={18}
                color={theme.colors.text.primary}
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: theme.spacing.lg,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    padding: theme.spacing.xl,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  glow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.3,
    transform: [{ scale: 1.5 }],
  },
  content: {
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  description: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 77, 79, 0.2)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 79, 0.5)',
    marginBottom: theme.spacing.lg,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSizes.sm,
    marginLeft: theme.spacing.sm,
  },
  tryAgainButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'center',
  },
  tryAgainText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSizes.xs,
    fontWeight: '600',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  connectedButton: {
    backgroundColor: 'rgba(6, 193, 103, 0.3)',
    borderColor: 'rgba(6, 193, 103, 0.6)',
  },
  loadingButton: {
    opacity: 0.8,
  },
  checkIcon: {
    marginLeft: theme.spacing.sm,
  },
  pulsing: {
    transform: [{ scale: 1.02 }],
  },
});

export default DynamicAuthBlob;
