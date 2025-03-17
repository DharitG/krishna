import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../constants/Theme';
import { layoutStyles, headerStyles, cardStyles, textStyles } from '../../constants/StyleGuide';
import Constants from 'expo-constants';
import accountStore from '../../services/accountStore';

const AccountScreen = () => {
  const router = useRouter();
  const [accounts, setAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  
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
      <View key={account.id} style={cardStyles.accountItem}>
        <View style={cardStyles.accountItemContent}>
          <View style={cardStyles.accountItemMain}>
            <Text style={cardStyles.accountItemTitle}>{displayName}</Text>
            {subtitle ? <Text style={cardStyles.accountItemSubtitle}>{subtitle}</Text> : null}
          </View>
          <View style={cardStyles.accountItemActions}>
            {!account.isActive && (
              <TouchableOpacity 
                style={cardStyles.accountItemButton}
                onPress={() => handleSetActiveAccount(service, account.id)}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.emerald} />
                <Text style={cardStyles.accountItemButtonText}>Set Active</Text>
              </TouchableOpacity>
            )}
            {account.isActive && (
              <View style={cardStyles.activeAccountBadge}>
                <Text style={cardStyles.activeAccountText}>Active</Text>
              </View>
            )}
            <TouchableOpacity 
              style={[cardStyles.accountItemButton, cardStyles.removeButton]}
              onPress={() => handleRemoveAccount(service, account.id)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  const renderServiceSection = (serviceName, serviceAccounts, icon) => {
    const formattedServiceName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
    
    return (
      <GlassCard key={serviceName} style={cardStyles.card}>
        <View style={cardStyles.cardHeader}>
          <Ionicons name={icon} size={24} color={colors.white} />
          <Text style={cardStyles.cardTitle}>{formattedServiceName}</Text>
        </View>
        
        {serviceAccounts.length > 0 ? (
          <View style={cardStyles.accountsList}>
            {serviceAccounts.map(account => renderAccountItem(serviceName, account))}
          </View>
        ) : (
          <Text style={cardStyles.noAccountsText}>No {formattedServiceName} accounts connected</Text>
        )}
        
        <TouchableOpacity 
          style={cardStyles.addAccountButton}
          onPress={() => handleAddAccount(serviceName)}
          disabled={!isComposioConfigured}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.emerald} />
          <Text style={cardStyles.addAccountText}>Add {formattedServiceName} Account</Text>
        </TouchableOpacity>
      </GlassCard>
    );
  };
  
  // Map of service names to their icons
  const serviceIcons = {
    github: 'logo-github',
    slack: 'logo-slack',
    gmail: 'mail-outline',
    discord: 'logo-discord',
    zoom: 'videocam-outline',
    asana: 'list-outline'
  };
  
  return (
    <GradientBackground>
      <SafeAreaView style={layoutStyles.container}>
        <StatusBar barStyle="light-content" />
        
        <View style={headerStyles.header}>
          <TouchableOpacity style={headerStyles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={28} color={colors.white} />
          </TouchableOpacity>
          <Text style={headerStyles.headerTitle}>Account Management</Text>
          <View style={headerStyles.rightPlaceholder} />
        </View>
        
        <ScrollView 
          style={layoutStyles.content}
          contentContainerStyle={layoutStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!isComposioConfigured && (
            <GlassCard style={[cardStyles.card, cardStyles.warningCard]}>
              <View style={cardStyles.cardHeader}>
                <Ionicons name="alert-circle-outline" size={24} color={colors.warning} />
                <Text style={[cardStyles.cardTitle, {color: colors.warning}]}>Composio Not Configured</Text>
              </View>
              <Text style={cardStyles.warningText}>
                Composio API Key is not configured. Some account features may be limited.
              </Text>
            </GlassCard>
          )}
          
          {loading ? (
            <View style={cardStyles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.emerald} />
              <Text style={cardStyles.loadingText}>Loading accounts...</Text>
            </View>
          ) : (
            <>
              {Object.keys(accounts).map(serviceName => 
                renderServiceSection(serviceName, accounts[serviceName], serviceIcons[serviceName])
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default AccountScreen;
