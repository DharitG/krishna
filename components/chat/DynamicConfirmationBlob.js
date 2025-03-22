import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../constants/NewTheme';

const { width } = Dimensions.get('window');

const DynamicConfirmationBlob = ({
  action = 'default',
  service,
  details = [],
  onConfirm,
  onCancel,
  isLoading = false,
  size = 'default'
}) => {
  const [isPulsing, setIsPulsing] = useState(false);

  const actionConfig = {
    email: {
      title: 'Send Email',
      icon: 'mail',
      gradientColors: theme.colors.gradients.gmail,
      dangerLevel: 'medium'
    },
    delete: {
      title: 'Delete Content',
      icon: 'trash-2',
      gradientColors: ['#EA4335', '#FF5252'],
      dangerLevel: 'high'
    },
    post: {
      title: 'Post Content',
      icon: 'send',
      gradientColors: ['#673AB7', '#3F51B5'],
      dangerLevel: 'medium'
    },
    access: {
      title: 'Access Data',
      icon: 'database',
      gradientColors: ['#009688', '#4CAF50'],
      dangerLevel: 'low'
    },
    create: {
      title: 'Create Content',
      icon: 'file-plus',
      gradientColors: ['#FF9800', '#F44336'],
      dangerLevel: 'medium'
    },
    default: {
      title: 'Confirm Action',
      icon: 'alert-circle',
      gradientColors: theme.colors.gradients.default,
      dangerLevel: 'medium'
    }
  };

  useEffect(() => {
    if (isLoading) {
      setIsPulsing(true);
    } else {
      setIsPulsing(false);
    }
  }, [isLoading]);

  const config = actionConfig[action] || actionConfig.default;
  const blobSize = size === 'large' ? width * 0.9 : width * 0.7;

  const handleConfirm = () => {
    if (isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm();
  };

  const handleCancel = () => {
    if (isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  const renderDangerBadge = () => {
    if (config.dangerLevel === 'low') return null;

    return (
      <View style={[
        styles.dangerBadge,
        config.dangerLevel === 'high' ? styles.highDangerBadge : styles.mediumDangerBadge,
      ]}>
        <Feather
          name={config.dangerLevel === 'high' ? 'alert-triangle' : 'alert-circle'}
          size={14}
          color={theme.colors.text.primary}
        />
        <Text style={styles.dangerBadgeText}>
          {config.dangerLevel === 'high' ? 'High Risk' : 'Caution'}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { width: blobSize }]}>
      <LinearGradient
        colors={config.gradientColors}
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
            backgroundColor: config.gradientColors[1],
          }
        ]} />

        {renderDangerBadge()}

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Feather name={config.icon} size={28} color={theme.colors.text.primary} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{config.title}</Text>
              {service && <Text style={styles.service}>via {service}</Text>}
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            {details.map((detail, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{detail.label}:</Text>
                <Text style={styles.detailValue}>{detail.value}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                isLoading && styles.loadingButton,
                config.dangerLevel === 'high' && styles.highDangerButton
              ]}
              onPress={handleConfirm}
              disabled={isLoading}
            >
              <Text style={styles.confirmButtonText}>
                {isLoading ? 'Processing...' : 'Confirm'}
              </Text>
              {!isLoading && (
                <Feather
                  name={config.dangerLevel === 'high' ? 'alert-triangle' : 'check'}
                  size={18}
                  color={theme.colors.text.primary}
                  style={styles.confirmIcon}
                />
              )}
            </TouchableOpacity>
          </View>
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
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  service: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  detailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm,
    width: 80,
  },
  detailValue: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.primary,
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    color: theme.colors.text.primary,
    fontWeight: '600',
    fontSize: theme.fontSizes.md,
  },
  confirmButton: {
    backgroundColor: 'rgba(39, 174, 96, 0.6)',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(39, 174, 96, 0.8)',
  },
  confirmButtonText: {
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    fontSize: theme.fontSizes.md,
  },
  confirmIcon: {
    marginLeft: theme.spacing.sm,
  },
  loadingButton: {
    opacity: 0.7,
  },
  highDangerButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.6)',
    borderColor: 'rgba(231, 76, 60, 0.8)',
  },
  dangerBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  mediumDangerBadge: {
    backgroundColor: 'rgba(241, 196, 15, 0.8)',
  },
  highDangerBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
  },
  dangerBadgeText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: 4,
  },
  pulsing: {
    transform: [{ scale: 1.02 }],
  },
});

export default DynamicConfirmationBlob;
