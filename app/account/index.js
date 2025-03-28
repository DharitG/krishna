import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  Alert, 
  ActivityIndicator, 
  Platform,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ChatBackgroundWrapper from '../../components/chat/ChatBackgroundWrapper';
import GlassCard from '../../components/GlassCard';
import { colors, spacing, typography, glassMorphism, shadows, borderRadius } from '../../constants/Theme';
import Constants from 'expo-constants';
import accountStore from '../../services/accountStore';

const AccountScreen = () => {
  const router = useRouter();
  const [accounts, setAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    accountType: 'Premium',
    joinDate: 'March 2023'
  });
  
  // Check if Composio is configured
  const { COMPOSIO_API_KEY } = Constants.expoConfig?.extra || {};
  const isComposioConfigured = !!COMPOSIO_API_KEY;
  
  useEffect(() => {
    // Fetch connected accounts on mount
    fetchConnectedAccounts();
  }, []);
  
  const fetchConnectedAccounts = async () => {
    setLoading(true);
    try {
      await accountStore.initializeAccounts();
      setAccounts(accountStore.getAccounts());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      Alert.alert('Error', 'Failed to fetch connected accounts');
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleAddAccount = async (serviceName) => {
    try {
      const result = await accountStore.authenticateService(serviceName);
      
      if (!result.success) {
        Alert.alert('Authentication Error', result.error);
        return;
      }
      
      // If we have a redirect URL, open it for authentication
      if (result.redirectUrl) {
        Alert.alert(
          'Add ' + serviceName + ' Account',
          'You will be redirected to authenticate with ' + serviceName,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => {
              // In a real implementation, you would handle the OAuth callback
              // and update the accounts list after successful authentication
              console.log('Redirecting to:', result.redirectUrl);
              
              // Simulate successful authentication and account addition
              setTimeout(async () => {
                // Mock user data for the new account
                const mockUserData = {
                  github: { username: 'new_github_user', email: 'new_user@github.com' },
                  slack: { username: 'new_slack_user', workspace: 'New Workspace' },
                  gmail: { email: 'new_user@gmail.com' },
                  discord: { username: 'new_discord_user', discriminator: '1234' },
                  zoom: { email: 'new_user@zoom.us', name: 'New Zoom User' },
                  asana: { username: 'new_asana_user', email: 'new_user@asana.com' }
                };
                
                // Add the new account
                await accountStore.addAccount(serviceName, mockUserData[serviceName]);
                
                // Refresh the accounts list
                fetchConnectedAccounts();
                
                // Show success message
                Alert.alert('Success', `${serviceName} account added successfully`);
              }, 1000);
            }}
          ]
        );
      } else {
        Alert.alert('Success', `Authentication initiated for ${serviceName}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to authenticate with ${serviceName}: ${error.message}`);
    }
  };
  
  const handleRemoveAccount = (serviceName, accountId) => {
    Alert.alert(
      'Remove Account',
      `Are you sure you want to remove this ${serviceName} account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await accountStore.removeAccount(serviceName, accountId);
              
              if (result.success) {
                // Refresh the accounts list
                fetchConnectedAccounts();
                Alert.alert('Success', `${serviceName} account removed successfully`);
              } else {
                Alert.alert('Error', result.error || `Failed to remove ${serviceName} account`);
              }
            } catch (error) {
              Alert.alert('Error', `Failed to remove ${serviceName} account: ${error.message}`);
            }
          }
        }
      ]
    );
  };
  
  const handleSetActiveAccount = async (serviceName, accountId) => {
    try {
      const result = await accountStore.setActiveAccount(serviceName, accountId);
      
      if (result.success) {
        // Refresh the accounts list
        fetchConnectedAccounts();
        Alert.alert('Success', `Active ${serviceName} account updated`);
      } else {
        Alert.alert('Error', result.error || `Failed to update active ${serviceName} account`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to update active ${serviceName} account: ${error.message}`);
    }
  };
  
  const renderAccountItem = (service, account) => {
    const displayName = account.username || account.email || account.workspace || 'Unknown';
    const subtitle = account.email && account.username ? account.email : 
                    account.workspace ? `Workspace: ${account.workspace}` : '';
    
    return (
      <View key={account.id} style={styles.accountItem}>
        <View style={styles.accountItemContent}>
          <View style={styles.accountItemMain}>
            <Text style={styles.accountItemTitle}>{displayName}</Text>
            {subtitle ? <Text style={styles.accountItemSubtitle}>{subtitle}</Text> : null}
          </View>
          <View style={styles.accountItemActions}>
            {!account.isActive && (
              <TouchableOpacity 
                style={styles.accountItemButton}
                onPress={() => handleSetActiveAccount(service, account.id)}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.emerald} />
                <Text style={styles.accountItemButtonText}>Set Active</Text>
              </TouchableOpacity>
            )}
            {account.isActive && (
              <View style={styles.activeAccountBadge}>
                <Text style={styles.activeAccountText}>Active</Text>
              </View>
            )}
            <TouchableOpacity 
              style={[styles.accountItemButton, styles.removeButton]}
              onPress={() => handleRemoveAccount(service, account.id)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  const renderServiceSection = (serviceName, serviceAccounts, icon) => {
    const formattedServiceName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
    
    return (
      <View key={serviceName} style={styles.serviceCardContainer}>
        <View style={styles.serviceCard}>
          <View style={styles.cardHeader}>
            <Ionicons name={icon} size={24} color={colors.white} />
            <Text style={styles.cardTitle}>{formattedServiceName}</Text>
          </View>
          
          {serviceAccounts.length > 0 ? (
            <View style={styles.accountsList}>
              {serviceAccounts.map(account => renderAccountItem(serviceName, account))}
            </View>
          ) : (
            <Text style={styles.noAccountsText}>No {formattedServiceName} accounts connected</Text>
          )}
          
          <TouchableOpacity 
            style={styles.addAccountButton}
            onPress={() => handleAddAccount(serviceName)}
            disabled={!isComposioConfigured}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.white} />
            <Text style={styles.addAccountButtonText}>Add {formattedServiceName} Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Get service icons that have accounts
  const getActiveServices = () => {
    const activeServices = [];
    Object.keys(accounts).forEach(service => {
      if (accounts[service] && accounts[service].length > 0) {
        activeServices.push(service);
      }
    });
    return activeServices;
  };
  
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
            <Text style={styles.headerTitle}>August</Text>
            <Text style={styles.headerSubtitle}>Account Settings</Text>
          </View>
          
          <View style={styles.headerButton} />
        </View>
        
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Card */}
          <View style={styles.profileCardContainer}>
            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={40} color={colors.white} />
                  </View>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{userInfo.name}</Text>
                  <Text style={styles.profileEmail}>{userInfo.email}</Text>
                  <View style={styles.badgeContainer}>
                    <View style={styles.premiumBadge}>
                      <Ionicons name="star" size={14} color={colors.warning} />
                      <Text style={styles.premiumText}>{userInfo.accountType}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.profileDetails}>
                <View style={styles.profileDetailItem}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="calendar-outline" size={20} color={colors.text.primary} />
                  </View>
                  <View style={styles.profileDetailText}>
                    <Text style={styles.profileDetailLabel}>Member Since</Text>
                    <Text style={styles.profileDetailValue}>{userInfo.joinDate}</Text>
                  </View>
                </View>
                
                <View style={styles.profileDetailItem}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="link-outline" size={20} color={colors.text.primary} />
                  </View>
                  <View style={styles.profileDetailText}>
                    <Text style={styles.profileDetailLabel}>Connected Services</Text>
                    <Text style={styles.profileDetailValue}>{getActiveServices().length} services</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity style={styles.editProfileButton} activeOpacity={0.7}>
                <Text style={styles.editProfileButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Connected Services Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Connected Services</Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.emerald} />
              <Text style={styles.loadingText}>Loading accounts...</Text>
            </View>
          ) : (
            <View style={styles.servicesContainer}>
              {renderServiceSection('github', accounts.github || [], 'logo-github')}
              {renderServiceSection('slack', accounts.slack || [], 'logo-slack')}
              {renderServiceSection('gmail', accounts.gmail || [], 'mail-outline')}
              {renderServiceSection('discord', accounts.discord || [], 'logo-discord')}
              {renderServiceSection('zoom', accounts.zoom || [], 'videocam-outline')}
              {renderServiceSection('asana', accounts.asana || [], 'list-outline')}
            </View>
          )}
          
          {!isComposioConfigured && (
            <View style={styles.warningCardContainer}>
              <View style={styles.warningCard}>
                <View style={styles.warningContent}>
                  <Ionicons name="alert-circle-outline" size={24} color={colors.warning} />
                  <Text style={styles.warningText}>
                    Composio API Key is not configured. Some features may be limited.
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Add some padding at the bottom */}
          <View style={{ height: 40 }} />
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
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    marginTop: 2,
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  profileCardContainer: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  profileCard: {
    backgroundColor: 'rgba(20, 32, 61, 0.85)',
    borderRadius: borderRadius.lg,
    borderColor: 'rgba(48, 109, 255, 0.15)',
    borderWidth: 1,
    shadowColor: '#306DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(48, 109, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(48, 109, 255, 0.3)',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.warning,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: spacing.md,
  },
  profileDetails: {
    padding: spacing.md,
  },
  profileDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(48, 109, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  profileDetailText: {
    marginLeft: spacing.sm,
  },
  profileDetailLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  profileDetailValue: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
  },
  editProfileButton: {
    margin: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: '#1D4ED8',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  editProfileButtonText: {
    color: colors.white,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  servicesContainer: {
    gap: spacing.md,
  },
  serviceCardContainer: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  serviceCard: {
    backgroundColor: 'rgba(20, 32, 61, 0.85)',
    borderRadius: borderRadius.lg,
    borderColor: 'rgba(48, 109, 255, 0.15)',
    borderWidth: 1,
    shadowColor: '#306DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
    marginLeft: spacing.md,
  },
  accountsList: {
    padding: spacing.sm,
  },
  accountItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  accountItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountItemMain: {
    flex: 1,
  },
  accountItemTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
    marginBottom: 2,
  },
  accountItemSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  accountItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  accountItemButtonText: {
    color: colors.emerald,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    marginLeft: 4,
  },
  removeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
  },
  activeAccountBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  activeAccountText: {
    color: colors.emerald,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  noAccountsText: {
    padding: spacing.md,
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    fontFamily: typography.fontFamily.regular,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  addAccountButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
  },
  warningCardContainer: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  warningCard: {
    backgroundColor: 'rgba(20, 32, 61, 0.85)',
    borderRadius: borderRadius.lg,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  warningText: {
    color: colors.text.warning,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.md,
    flex: 1,
  },
};

export default AccountScreen;
