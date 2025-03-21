import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Animated,
  Easing 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { colors } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DynamicAuthBlob = ({ 
  service, 
  onAuthenticate, 
  isLoading,
  isConnected,
  error,
  onErrorDismiss,
  size = 'default' 
}) => {
  const [animation] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(0));
  
  const serviceConfig = {
    github: {
      title: 'GitHub',
      icon: 'github',
      gradientColors: ['#2A2F3A', '#4078c0'],
      description: 'Access repository details, issues, and PRs'
    },
    gmail: {
      title: 'Gmail',
      icon: 'mail',
      gradientColors: ['#4285F4', '#EA4335'],
      description: 'Read and send emails on your behalf'
    },
    slack: {
      title: 'Slack',
      icon: 'slack',
      gradientColors: ['#4A154B', '#611f69'],
      description: 'Send messages and access channels'
    },
    calendar: {
      title: 'Calendar',
      icon: 'calendar',
      gradientColors: ['#0F9D58', '#4285F4'],
      description: 'View and create calendar events'
    },
    dropbox: {
      title: 'Dropbox',
      icon: 'dropbox',
      gradientColors: ['#0061FF', '#00BFFF'],
      description: 'Access your Dropbox files and folders'
    },
    asana: {
      title: 'Asana',
      icon: 'check-square',
      gradientColors: ['#FC636B', '#FF8450'],
      description: 'Access tasks and projects'
    },
    default: {
      title: 'Connect',
      icon: 'link',
      gradientColors: [colors.emerald, colors.purple],
      description: 'Connect to an external service'
    }
  };

  const config = serviceConfig[service] || serviceConfig.default;
  const blobSize = size === 'large' ? width * 0.9 : width * 0.7;

  useEffect(() => {
    if (isLoading) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }

    Animated.timing(animation, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true
    }).start();
  }, [isLoading]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnimation.setValue(0);
  };

  const handlePress = () => {
    if (isLoading || isConnected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAuthenticate(service);
  };

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });

  const pulseScale = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05]
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale },
            { scale: pulseScale }
          ]
        }
      ]}
    >
      <BlurView intensity={30} style={styles.blurContainer}>
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { width: blobSize, height: blobSize * 0.65 }]}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Feather name={config.icon} size={24} color="#fff" />
              <Text style={styles.title}>{config.title}</Text>
            </View>
            
            <Text style={styles.description}>{config.description}</Text>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={onErrorDismiss} style={styles.dismissButton}>
                  <Text style={styles.dismissText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.button,
                  isConnected ? styles.connectedButton : {},
                  isLoading ? styles.loadingButton : {}
                ]}
                onPress={handlePress}
                disabled={isLoading || isConnected}
              >
                <Text style={styles.buttonText}>
                  {isConnected ? 'Connected' : isLoading ? 'Connecting...' : 'Connect'}
                </Text>
                {isConnected && (
                  <Feather name="check-circle" size={18} color="#fff" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            )}
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  connectedButton: {
    backgroundColor: 'rgba(39, 174, 96, 0.3)',
    borderColor: 'rgba(39, 174, 96, 0.6)',
  },
  loadingButton: {
    opacity: 0.7,
  },
  checkIcon: {
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 87, 87, 0.3)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 87, 0.6)',
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  dismissButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  dismissText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default DynamicAuthBlob;