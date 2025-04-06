import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
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
      icon: 'logo-github',
      description: 'Access repository details, issues, and PRs'
    },
    gmail: {
      title: 'Gmail',
      icon: 'mail-outline',
      description: 'Read and send emails on your behalf'
    },
    google: {
      title: 'Google',
      icon: 'logo-google',
      description: 'Access Google services (Gmail, Drive, Calendar)'
    },
    slack: {
      title: 'Slack',
      icon: 'logo-slack',
      description: 'Send messages and access channels'
    },
    calendar: {
      title: 'Calendar',
      icon: 'calendar-outline',
      description: 'View and create calendar events'
    },
    dropbox: {
      title: 'Dropbox',
      icon: 'cloud-outline',
      description: 'Access your Dropbox files and folders'
    },
    asana: {
      title: 'Asana',
      icon: 'list-outline',
      description: 'Access tasks and projects'
    },
    discord: {
      title: 'Discord',
      icon: 'logo-discord',
      description: 'Access Discord channels and messages'
    },
    zoom: {
      title: 'Zoom',
      icon: 'videocam-outline',
      description: 'Schedule and join Zoom meetings'
    },
    notion: {
      title: 'Notion',
      icon: 'document-text-outline',
      description: 'Access Notion pages and databases'
    },
    figma: {
      title: 'Figma',
      icon: 'color-palette-outline',
      description: 'Access Figma designs and projects'
    },
    stripe: {
      title: 'Stripe',
      icon: 'card-outline',
      description: 'Process payments and manage subscriptions'
    },
    outlook: {
      title: 'Outlook',
      icon: 'mail-outline',
      description: 'Access emails and calendar events'
    },
    trello: {
      title: 'Trello',
      icon: 'grid-outline',
      description: 'Manage boards, lists, and cards'
    },
    twitter: {
      title: 'Twitter',
      icon: 'logo-twitter',
      description: 'Access tweets and post updates'
    },
    linkedin: {
      title: 'LinkedIn',
      icon: 'logo-linkedin',
      description: 'Access professional network and posts'
    },
    reddit: {
      title: 'Reddit',
      icon: 'logo-reddit',
      description: 'Access subreddits and posts'
    },
    youtube: {
      title: 'YouTube',
      icon: 'logo-youtube',
      description: 'Access videos and channels'
    },
    onedrive: {
      title: 'OneDrive',
      icon: 'cloud-outline',
      description: 'Access files and folders'
    },
    calendly: {
      title: 'Calendly',
      icon: 'calendar-outline',
      description: 'Schedule and manage appointments'
    },
    blackboard: {
      title: 'Blackboard',
      icon: 'school-outline',
      description: 'Access courses and assignments'
    },
    weathermap: {
      title: 'Weather',
      icon: 'cloudy-outline',
      description: 'Access weather data and forecasts'
    },
    canvas: {
      title: 'Canvas',
      icon: 'school-outline',
      description: 'Access courses, assignments, and grades'
    },
    perplexityai: {
      title: 'Perplexity AI',
      icon: 'help-circle-outline',
      description: 'Access AI-powered search and answers'
    },
    default: {
      title: 'Connect',
      icon: 'link-outline',
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
              <Ionicons name={config.icon} size={24} color={theme.colors.text.primary} />
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
                <Ionicons name="alert-circle-outline" size={16} color="#FF4D4F" />
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
              <Ionicons
                name="checkmark-circle"
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
