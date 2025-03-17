import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../constants/Theme';
import { layoutStyles, headerStyles, cardStyles, textStyles } from '../../constants/StyleGuide';
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
      <GlassCard key={serviceName} style={styles.serviceCard}>
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
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.white} />
          <Text style={styles.addAccountButtonText}>Add {formattedServiceName} Account</Text>
        </TouchableOpacity>
      </GlassCard>
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
    <SafeAreaView style={[layoutStyles.safeArea, { backgroundColor: colors.background.primary }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accounts</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <GlassCard style={styles.profileCard}>
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
              <Ionicons name="calendar-outline" size={20} color={colors.lightGray} />
              <View style={styles.profileDetailText}>
                <Text style={styles.profileDetailLabel}>Member Since</Text>
                <Text style={styles.profileDetailValue}>{userInfo.joinDate}</Text>
              </View>
            </View>
            
            <View style={styles.profileDetailItem}>
              <Ionicons name="link-outline" size={20} color={colors.lightGray} />
              <View style={styles.profileDetailText}>
                <Text style={styles.profileDetailLabel}>Connected Services</Text>
                <Text style={styles.profileDetailValue}>{getActiveServices().length} services</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </GlassCard>
        
        {/* Connected Services Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Connected Services</Text>
          <View style={styles.sectionDivider} />
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
          <GlassCard style={styles.warningCard}>
            <View style={styles.warningContent}>
              <Ionicons name="alert-circle-outline" size={24} color={colors.warning} />
              <Text style={styles.warningText}>
                Composio API Key is not configured. Some features may be limited.
              </Text>
            </View>
          </GlassCard>
        )}
        
        {/* Add some padding at the bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Custom styles for this screen
const styles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  profileCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.emeraldTransparent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.lightGray,
    marginBottom: 8,
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
    fontSize: 12,
    fontWeight: '500',
    color: colors.warning,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  profileDetails: {
    padding: 16,
  },
  profileDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileDetailText: {
    marginLeft: 12,
  },
  profileDetailLabel: {
    fontSize: 14,
    color: colors.lightGray,
  },
  profileDetailValue: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
  },
  editProfileButton: {
    margin: 16,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editProfileButtonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  servicesContainer: {
    gap: 16,
  },
  serviceCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 12,
  },
  accountsList: {
    padding: 8,
  },
  accountItem: {
    padding: 12,
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
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
    marginBottom: 2,
  },
  accountItemSubtitle: {
    fontSize: 14,
    color: colors.lightGray,
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
    fontSize: 14,
    fontWeight: '500',
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
    fontSize: 14,
    fontWeight: '500',
  },
  noAccountsText: {
    padding: 16,
    color: colors.lightGray,
    fontSize: 15,
    textAlign: 'center',
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  addAccountButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.lightGray,
    marginTop: 12,
    fontSize: 16,
  },
  warningCard: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  warningText: {
    color: colors.warning,
    marginLeft: 12,
    flex: 1,
    fontSize: 15,
  },
};

export default AccountScreen;
