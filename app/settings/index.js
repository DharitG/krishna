import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Switch, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ChatBackgroundWrapper from '../../components/chat/ChatBackgroundWrapper';
import GlassCard from '../../components/GlassCard';
import { colors, spacing, typography, glassMorphism } from '../../constants/Theme';
import Constants from 'expo-constants';
import useZustandChatStore from '../../services/chatStore';
import { signOut } from '../../services/supabase';
import { useAuth } from '../../services/authContext';
import subscriptionService from '../../services/subscriptionService';

const SettingsScreen = () => {
  const router = useRouter();
  const { user, getCurrentPlan, fetchSubscriptionStatus } = useAuth();
  
  // Get auth methods from chat store
  const authenticateService = useZustandChatStore(state => state.authenticateService);
  
  // Check if Composio is configured
  const { COMPOSIO_API_KEY } = Constants.expoConfig?.extra || {};
  const isComposioConfigured = !!COMPOSIO_API_KEY;
  
  // State for toggles and subscription
  const [useTools, setUseTools] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [features, setFeatures] = useState({
    github: true,
    slack: true,
    gmail: true,
  });
  
  // Fetch current subscription plan
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (user) {
        await fetchSubscriptionStatus(user.id);
        const plan = getCurrentPlan();
        setCurrentPlan(plan);
      }
    };
    
    loadSubscriptionData();
  }, [user]);
  
  const getPlanDisplayName = (plan) => {
    switch(plan) {
      case 'utopia': return 'Utopia';
      case 'eden': return 'Eden';
      default: return 'Free';
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleSignOut = async () => {
    try {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign Out', 
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut();
                // Redirect to the login screen or home screen
                router.replace('/');
              } catch (error) {
                Alert.alert('Error', `Failed to sign out: ${error.message}`);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to sign out: ${error.message}`);
    }
  };
  
  const handleAuthenticateService = async (serviceName) => {
    try {
      const result = await authenticateService(serviceName);
      
      if (result.error) {
        Alert.alert('Authentication Error', result.message);
        return;
      }
      
      // If we have a redirect URL, open it for authentication
      if (result.redirectUrl) {
        Alert.alert(
          'Authenticate with ' + serviceName,
          'You will be redirected to authenticate with ' + serviceName,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => Linking.openURL(result.redirectUrl) }
          ]
        );
      } else {
        Alert.alert('Success', `Authentication initiated for ${serviceName}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to authenticate with ${serviceName}: ${error.message}`);
    }
  };
  
  const handleToggleGithub = (value) => {
    setFeatures(prev => ({ ...prev, github: value }));
  };
  
  const handleToggleSlack = (value) => {
    setFeatures(prev => ({ ...prev, slack: value }));
  };
  
  const handleToggleGmail = (value) => {
    setFeatures(prev => ({ ...prev, gmail: value }));
  };
  
  // These would be connected to real settings in a full app
  const settings = [
    {
      title: 'General',
      items: [
        { label: 'API Key', icon: 'key-outline', hasDetail: true, value: '••••••••••••••••' },
        { label: 'Theme', icon: 'color-palette-outline', hasDetail: true, value: 'Dark' },
        { 
          label: 'Sign Out', 
          icon: 'log-out-outline', 
          hasDetail: false,
          onPress: handleSignOut
        },
      ]
    },
    {
      title: 'Chat',
      items: [
        { label: 'Model', icon: 'analytics-outline', hasDetail: true, value: 'GPT-4' },
        { label: 'Clear Conversation', icon: 'trash-outline', hasDetail: false },
        { label: 'Chat History', icon: 'time-outline', hasDetail: true },
        { label: 'Speech Output', icon: 'volume-high-outline', hasDetail: true, value: 'Off' },
      ]
    },
    {
      title: 'Composio Integration',
      items: [
        {
          label: 'Use Tools',
          icon: 'construct-outline',
          hasDetail: false,
          renderItem: () => (
            <View style={styles.cardItemRight}>
              <Switch
                trackColor={{ false: colors.darkGray, true: colors.emeraldTransparent }}
                thumbColor={useTools ? colors.emerald : colors.lightGray}
                ios_backgroundColor={colors.darkGray}
                onValueChange={setUseTools}
                value={useTools}
                disabled={!isComposioConfigured}
              />
            </View>
          ),
        },
        ...(!isComposioConfigured ? [{
          label: 'Composio API Key Not Configured',
          icon: 'alert-circle-outline',
          hasDetail: false,
          labelStyle: { color: colors.warning },
        }] : []),
        ...(isComposioConfigured ? [
          {
            label: 'GitHub',
            icon: 'logo-github',
            hasDetail: false,
            renderItem: () => (
              <View style={styles.cardItemRight}>
                <Switch
                  trackColor={{ false: colors.darkGray, true: colors.emeraldTransparent }}
                  thumbColor={features.github ? colors.emerald : colors.lightGray}
                  ios_backgroundColor={colors.darkGray}
                  onValueChange={handleToggleGithub}
                  value={features.github}
                  disabled={!useTools}
                />
              </View>
            ),
          },
          {
            label: 'Authenticate GitHub',
            icon: 'key-outline',
            hasDetail: false,
            onPress: () => handleAuthenticateService('github'),
            disabled: !features.github || !useTools,
          },
          {
            label: 'Slack',
            icon: 'logo-slack',
            hasDetail: false,
            renderItem: () => (
              <View style={styles.cardItemRight}>
                <Switch
                  trackColor={{ false: colors.darkGray, true: colors.emeraldTransparent }}
                  thumbColor={features.slack ? colors.emerald : colors.lightGray}
                  ios_backgroundColor={colors.darkGray}
                  onValueChange={handleToggleSlack}
                  value={features.slack}
                  disabled={!useTools}
                />
              </View>
            ),
          },
          {
            label: 'Authenticate Slack',
            icon: 'key-outline',
            hasDetail: false,
            onPress: () => handleAuthenticateService('slack'),
            disabled: !features.slack || !useTools,
          },
          {
            label: 'Gmail',
            icon: 'mail-outline',
            hasDetail: false,
            renderItem: () => (
              <View style={styles.cardItemRight}>
                <Switch
                  trackColor={{ false: colors.darkGray, true: colors.emeraldTransparent }}
                  thumbColor={features.gmail ? colors.emerald : colors.lightGray}
                  ios_backgroundColor={colors.darkGray}
                  onValueChange={handleToggleGmail}
                  value={features.gmail}
                  disabled={!useTools}
                />
              </View>
            ),
          },
          {
            label: 'Authenticate Gmail',
            icon: 'key-outline',
            hasDetail: false,
            onPress: () => handleAuthenticateService('gmail'),
            disabled: !features.gmail || !useTools,
          }
        ] : []),
      ]
    },
    {
      title: 'Features',
      items: [
        { label: 'Image Generation', icon: 'image-outline', hasDetail: true, value: 'On' },
        { label: 'Voice Commands', icon: 'mic-outline', hasDetail: true, value: 'Off' },
        { label: 'Web Search', icon: 'search-outline', hasDetail: true, value: 'On' },
      ]
    },
    {
      title: 'Subscription',
      items: [
        { 
          label: 'Current Plan', 
          icon: 'ribbon-outline', 
          hasDetail: true, 
          value: getPlanDisplayName(currentPlan) 
        },
        { 
          label: 'Manage Subscription', 
          icon: 'card-outline', 
          hasDetail: true,
          onPress: () => router.push('/subscription') 
        },
        { 
          label: 'Upgrade', 
          icon: 'arrow-up-circle-outline', 
          hasDetail: true,
          onPress: () => router.push('/subscription')
        },
      ]
    },
    {
      title: 'About',
      items: [
        { label: 'Version', icon: 'information-circle-outline', hasDetail: true, value: '1.0.0' },
        { label: 'Terms of Service', icon: 'document-text-outline', hasDetail: true },
        { label: 'Privacy Policy', icon: 'shield-outline', hasDetail: true },
      ]
    },
  ];

  return (
    <ChatBackgroundWrapper>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} weight="regular" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
          
          <View style={styles.headerButton} />
        </View>
        
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          {settings.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              
              <GlassCard style={[styles.glassCard, { backgroundColor: 'rgba(26, 44, 75, 0.6)', borderColor: 'rgba(48, 109, 255, 0.2)' }]}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity 
                    key={itemIndex} 
                    style={[
                      styles.cardItem,
                      itemIndex === section.items.length - 1 ? styles.cardItemLast : null,
                      item.disabled ? { opacity: 0.5 } : null
                    ]}
                    onPress={item.onPress}
                    disabled={item.disabled}
                  >
                    <View style={styles.cardItemLeft}>
                      <Ionicons 
                        name={item.icon} 
                        size={22} 
                        color={item.labelStyle?.color || colors.emerald} 
                        style={styles.cardItemIcon} 
                      />
                      <Text style={[styles.cardItemLabel, item.labelStyle]}>
                        {item.label}
                      </Text>
                    </View>
                    
                    <View style={styles.cardItemRight}>
                      {item.renderItem ? item.renderItem() : (
                        <>
                          {item.value && <Text style={styles.cardItemValue}>{item.value}</Text>}
                          {item.hasDetail && <Ionicons name="chevron-forward" size={18} color={colors.lightGray} />}
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </GlassCard>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ChatBackgroundWrapper>
  );
};

const styles = {
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingTop: Platform.OS === 'android' ? spacing.xl : spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.brand,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.primaryText,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  glassCard: {
    ...glassMorphism.chatBubble,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardItemLast: {
    borderBottomWidth: 0,
  },
  cardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardItemIcon: {
    marginRight: spacing.sm,
  },
  cardItemLabel: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    fontFamily: typography.fontFamily.regular,
  },
  cardItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardItemValue: {
    fontSize: typography.fontSize.sm,
    color: colors.secondaryText,
    marginRight: spacing.sm,
    fontFamily: typography.fontFamily.regular,
  },
};

export default SettingsScreen;