import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { colors } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DynamicConfirmationBlob = ({
  action,
  service,
  details,
  onConfirm,
  onCancel,
  isLoading,
  size = 'default'
}) => {
  const [animation] = useState(new Animated.Value(0));
  const [warningAnimation] = useState(new Animated.Value(0));
  
  const actionConfig = {
    email: {
      title: 'Send Email',
      icon: 'mail',
      gradientColors: ['#4285F4', '#34A853'],
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
      gradientColors: [colors.emerald, colors.purple],
      dangerLevel: 'medium'
    }
  };

  const config = actionConfig[action] || actionConfig.default;
  const blobSize = size === 'large' ? width * 0.9 : width * 0.7;
  
  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();
    
    startWarningAnimation();
  }, []);
  
  const startWarningAnimation = () => {
    if (config.dangerLevel === 'high') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(warningAnimation, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true
          }),
          Animated.timing(warningAnimation, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true
          })
        ])
      ).start();
    }
  };
  
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
  
  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });
  
  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });
  
  const warningOpacity = warningAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1]
  });

  const renderDangerBadge = () => {
    if (config.dangerLevel === 'low') return null;
    
    return (
      <Animated.View style={[
        styles.dangerBadge,
        config.dangerLevel === 'high' ? styles.highDangerBadge : styles.mediumDangerBadge,
        config.dangerLevel === 'high' ? { opacity: warningOpacity } : {}
      ]}>
        <Feather 
          name={config.dangerLevel === 'high' ? 'alert-triangle' : 'alert-circle'} 
          size={14} 
          color="#fff" 
        />
        <Text style={styles.dangerBadgeText}>
          {config.dangerLevel === 'high' ? 'High Risk' : 'Caution'}
        </Text>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale }],
          opacity
        }
      ]}
    >
      <BlurView intensity={40} style={styles.blurContainer}>
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { width: blobSize, height: blobSize * 0.7 }]}
        >
          {renderDangerBadge()}
          
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Feather name={config.icon} size={28} color="#fff" />
              </View>
              <Text style={styles.title}>{config.title}</Text>
              {service && <Text style={styles.service}>via {service}</Text>}
            </View>
            
            <View style={styles.detailsContainer}>
              {details.map((detail, index) => (
                <View key={index} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{detail.label}:</Text>
                  <Text style={styles.detailValue}>{detail.value}</Text>
                </View>
              ))}
            </View>
            
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
                  isLoading ? styles.loadingButton : {},
                  config.dangerLevel === 'high' ? styles.highDangerButton : {}
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
                    color="#fff" 
                    style={styles.confirmIcon} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 24,
    position: 'relative',
  },
  content: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  service: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  detailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
    marginRight: 8,
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: 'rgba(39, 174, 96, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(39, 174, 96, 0.8)',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmIcon: {
    marginLeft: 8,
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
    top: 12,
    right: 12,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediumDangerBadge: {
    backgroundColor: 'rgba(241, 196, 15, 0.8)',
  },
  highDangerBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
  },
  dangerBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
});

export default DynamicConfirmationBlob;