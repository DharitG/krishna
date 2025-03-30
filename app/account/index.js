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
  Animated,
  Easing,
  Image,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ChatBackgroundWrapper from '../../components/chat/ChatBackgroundWrapper';
import GlassCard from '../../components/GlassCard';
import { colors, spacing, typography, glassMorphism, shadows, borderRadius } from '../../constants/Theme';
import Constants from 'expo-constants';
import accountStore from '../../services/accountStore';
import * as ImagePicker from 'expo-image-picker';

const AccountScreen = () => {
  const router = useRouter();
  const [accounts, setAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    accountType: 'Eden',
    joinDate: 'March 2023',
    avatarUrl: null
  });
  
  // Animation state variables
  const [serviceAnimations, setServiceAnimations] = useState({});
  const [addAccountAnimation] = useState(new Animated.Value(0));
  const [removeAccountAnimation] = useState(new Animated.Value(0));
  
  // Error handling state
  const [errors, setErrors] = useState({});
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Profile image upload state
  const [uploading, setUploading] = useState(false);
  
  // Check if Composio is configured
  const { COMPOSIO_API_KEY } = Constants.expoConfig?.extra || {};
  const isComposioConfigured = !!COMPOSIO_API_KEY;
  
  // New state for search
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  
  // List of all available services with their icons and display names
  const allServices = [
    { id: 'github', name: 'GitHub', icon: 'logo-github', color: '#24292e' },
    { id: 'slack', name: 'Slack', icon: 'logo-slack', color: '#4A154B' },
    { id: 'gmail', name: 'Gmail', icon: 'mail-outline', color: '#D44638' },
    { id: 'discord', name: 'Discord', icon: 'logo-discord', color: '#5865F2' },
    { id: 'zoom', name: 'Zoom', icon: 'videocam-outline', color: '#2D8CFF' },
    { id: 'asana', name: 'Asana', icon: 'list-outline', color: '#FC636B' },
    { id: 'dropbox', name: 'Dropbox', icon: 'cloud-outline', color: '#0061FF' },
    { id: 'notion', name: 'Notion', icon: 'document-text-outline', color: '#000000' },
    { id: 'figma', name: 'Figma', icon: 'color-palette-outline', color: '#F24E1E' },
    { id: 'stripe', name: 'Stripe', icon: 'card-outline', color: '#635BFF' }
  ];
  
  useEffect(() => {
    // Fetch connected accounts on mount
    fetchConnectedAccounts();
    
    // Initialize animations for each service
    const animations = {};
    ['github', 'slack', 'gmail', 'discord', 'zoom', 'asana'].forEach(service => {
      animations[service] = new Animated.Value(0);
    });
    setServiceAnimations(animations);
  }, []);
  
  const fetchConnectedAccounts = async () => {
    setLoading(true);
    setErrors(prev => ({ ...prev, general: null }));
    
    try {
      await accountStore.initializeAccounts();
      setAccounts(accountStore.getAccounts());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setErrors(prev => ({ 
        ...prev, 
        general: 'Failed to fetch connected accounts. Please check your connection.' 
      }));
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  // Animation functions
  const animateAddAccount = (serviceName) => {
    // Reset animation value
    addAccountAnimation.setValue(0);
    
    // Start animation
    Animated.timing(addAccountAnimation, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  };

  const animateRemoveAccount = () => {
    // Reset animation value
    removeAccountAnimation.setValue(0);
    
    // Start animation
    Animated.timing(removeAccountAnimation, {
      toValue: 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const toggleServiceExpansion = (serviceName) => {
    // Toggle animation value between 0 and 1
    const toValue = serviceAnimations[serviceName]._value === 0 ? 1 : 0;
    
    Animated.timing(serviceAnimations[serviceName], {
      toValue,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // We'll animate height which isn't supported by native driver
    }).start();
  };
  
  const handleAddAccount = async (serviceName) => {
    // Clear any previous errors for this service
    setErrors(prev => ({ ...prev, [serviceName]: null }));
    
    try {
      const result = await accountStore.authenticateService(serviceName);
      
      if (!result.success) {
        setErrors(prev => ({ ...prev, [serviceName]: result.error }));
        return;
      }
      
      // If we have a redirect URL, open it for authentication
      if (result.redirectUrl) {
        // Show confirmation dialog
        Alert.alert(
          'Add ' + serviceName + ' Account',
          'You will be redirected to authenticate with ' + serviceName,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => {
              // Handle OAuth flow
              console.log('Redirecting to:', result.redirectUrl);
              
              // In a real implementation, you would handle the OAuth callback
              // and update the accounts list after successful authentication
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
                
                try {
                  // Add the new account
                  await accountStore.addAccount(serviceName, mockUserData[serviceName]);
                  
                  // Refresh the accounts list
                  fetchConnectedAccounts();
                  
                  // Show success message with toast instead of alert
                  // You can implement a toast component or use a library
                } catch (err) {
                  setErrors(prev => ({ 
                    ...prev, 
                    [serviceName]: `Failed to add account: ${err.message}` 
                  }));
                }
              }, 1000);
            }}
          ]
        );
      } else {
        // Show a toast notification instead of an alert
        console.log('Authentication initiated for', serviceName);
      }
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        [serviceName]: `Failed to authenticate: ${error.message}` 
      }));
    }
  };
  
  const handleRemoveAccount = (serviceName, accountId) => {
    // Start remove animation
    animateRemoveAccount();
    
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
              } else {
                setErrors(prev => ({ 
                  ...prev, 
                  [serviceName]: result.error || `Failed to remove ${serviceName} account` 
                }));
              }
            } catch (error) {
              setErrors(prev => ({ 
                ...prev, 
                [serviceName]: `Failed to remove ${serviceName} account: ${error.message}` 
              }));
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
      } else {
        setErrors(prev => ({ 
          ...prev, 
          [serviceName]: result.error || `Failed to update active ${serviceName} account` 
        }));
      }
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        [serviceName]: `Failed to update active ${serviceName} account: ${error.message}` 
      }));
    }
  };
  
  const renderAccountItem = (service, account) => {
    const displayName = account.username || account.email || account.workspace || 'Unknown';
    const subtitle = account.email && account.username ? account.email : 
                    account.workspace ? `Workspace: ${account.workspace}` : '';
    
    return (
      <Animated.View 
        key={account.id} 
        style={[
          styles.accountItem,
          {
            transform: [
              {
                scale: removeAccountAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0.95, 1]
                })
              }
            ]
          }
        ]}
      >
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
      </Animated.View>
    );
  };
  
  // Filter services based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServices(allServices);
    } else {
      const filtered = allServices.filter(service => 
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchQuery]);
  
  // Initialize filtered services with all services
  useEffect(() => {
    setFilteredServices(allServices);
  }, []);
  
  // Redesigned service card for a more compact and attractive view
  const renderServiceCard = (service) => {
    const serviceAccounts = accounts[service.id] || [];
    const connectedCount = serviceAccounts.length;
    const isConnected = connectedCount > 0;
    
    return (
      <TouchableOpacity 
        key={service.id}
        style={[
          styles.serviceCardNew,
          { borderColor: isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(48, 109, 255, 0.15)' }
        ]}
        onPress={() => toggleServiceExpansion(service.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.serviceIconContainer, { backgroundColor: `${service.color}30` }]}>
          <Ionicons name={service.icon} size={22} color={service.color} />
        </View>
        <View style={styles.serviceCardContent}>
          <Text style={styles.serviceCardTitle}>{service.name}</Text>
          <Text style={styles.serviceCardSubtitle}>
            {isConnected 
              ? `${connectedCount} account${connectedCount > 1 ? 's' : ''} connected` 
              : 'Not connected'}
          </Text>
        </View>
        <View style={styles.serviceCardAction}>
          {isConnected ? (
            <TouchableOpacity 
              style={styles.connectedBadge}
              onPress={() => toggleServiceExpansion(service.id)}
            >
              <Ionicons name="checkmark-circle" size={16} color={colors.emerald} />
              <Text style={styles.connectedText}>Manage</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.connectButton}
              onPress={() => {
                animateAddAccount(service.id);
                handleAddAccount(service.id);
              }}
            >
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
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
  
  // Profile image functions
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant access to your photos to change your profile picture.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const uploadProfileImage = async (uri) => {
    setUploading(true);
    try {
      // Create a file name for the image
      const fileName = `profile-${Date.now()}.jpg`;
      
      // In a real implementation, you would upload this to Supabase storage
      // For now, we'll simulate a successful upload
      
      // Update the user info with the new avatar URL
      setUserInfo(prev => ({
        ...prev,
        avatarUrl: uri // For demo purposes, just use the local URI
      }));
      
      setTimeout(() => {
        setUploading(false);
        Alert.alert('Success', 'Profile picture updated successfully');
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image: ' + error.message);
      setUploading(false);
    }
  };
  
  // Error message component
  const ErrorMessage = ({ service, message, onRetry }) => (
    <View style={styles.errorContainer}>
      <View style={styles.errorContent}>
        <Ionicons name="alert-circle" size={20} color={colors.error} />
        <Text style={styles.errorText}>{message}</Text>
      </View>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Profile edit modal component
  const ProfileEditModal = () => {
    // Create local state that's independent of the parent component's state
    const [localProfile, setLocalProfile] = useState({
      full_name: '',
      bio: ''
    });
    
    // Initialize the local state when the modal opens
    useEffect(() => {
      if (isEditingProfile) {
        // Set the local state once when the modal opens
        setLocalProfile({
          full_name: userInfo.name || '',
          bio: userInfo.bio || ''
        });
      }
    }, [isEditingProfile]); // Only depend on isEditingProfile

    const handleSave = async () => {
      try {
        // Update the parent state only when saving
        setUserInfo(prev => ({
          ...prev,
          name: localProfile.full_name,
          bio: localProfile.bio
        }));
        
        setIsEditingProfile(false);
        Alert.alert('Success', 'Profile updated successfully');
      } catch (error) {
        Alert.alert('Error', 'Failed to update profile: ' + error.message);
      }
    };

    // Don't render anything if the modal is not visible
    if (!isEditingProfile) return null;

    return (
      <Modal
        visible={isEditingProfile}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditingProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setIsEditingProfile(false)}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={localProfile.full_name}
                onChangeText={(text) => setLocalProfile(prev => ({...prev, full_name: text}))}
                placeholder="Enter your full name"
                placeholderTextColor={colors.text.secondary}
              />
              
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                value={localProfile.bio}
                onChangeText={(text) => setLocalProfile(prev => ({...prev, bio: text}))}
                placeholder="Tell us about yourself"
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsEditingProfile(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
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
            <Text style={styles.headerTitle}>Account</Text>
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
                  <TouchableOpacity onPress={pickImage}>
                    <View style={styles.avatar}>
                      {userInfo.avatarUrl ? (
                        <Image 
                          source={{ uri: userInfo.avatarUrl }} 
                          style={styles.avatarImage} 
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons name="person" size={40} color={colors.white} />
                      )}
                    </View>
                    <View style={styles.avatarEditBadge}>
                      <Ionicons name="add-circle" size={22} color={colors.emerald} />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{userInfo.name}</Text>
                  <Text style={styles.profileEmail}>{userInfo.email}</Text>
                  <View style={styles.badgeContainer}>
                    <View style={[
                      styles.planBadge, 
                      { 
                        backgroundColor: userInfo.accountType === 'Free' 
                          ? 'rgba(16, 185, 129, 0.15)' 
                          : userInfo.accountType === 'Eden'
                            ? 'rgba(79, 70, 229, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)'
                      }
                    ]}>
                      <Ionicons 
                        name={
                          userInfo.accountType === 'Free' 
                            ? 'leaf-outline' 
                            : userInfo.accountType === 'Eden'
                              ? 'sparkles-outline'
                              : 'star'
                        } 
                        size={16} 
                        color={
                          userInfo.accountType === 'Free' 
                            ? colors.emerald 
                            : userInfo.accountType === 'Eden'
                              ? '#6366F1'
                              : colors.warning
                        } 
                      />
                      <Text style={[
                        styles.planBadgeText, 
                        { 
                          color: userInfo.accountType === 'Free' 
                            ? colors.emerald 
                            : userInfo.accountType === 'Eden'
                              ? '#6366F1'
                              : colors.warning
                        }
                      ]}>
                        {userInfo.accountType} Plan
                      </Text>
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
              
              <TouchableOpacity style={styles.editProfileButton} activeOpacity={0.7} onPress={() => setIsEditingProfile(true)}>
                <Text style={styles.editProfileButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Connected Services Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Connected Services</Text>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={colors.text.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services..."
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.emerald} />
              <Text style={styles.loadingText}>Loading accounts...</Text>
            </View>
          ) : (
            <View style={styles.servicesGridContainer}>
              {filteredServices.map(service => renderServiceCard(service))}
            </View>
          )}
          
          {/* Service Details Modal (shows when a service is clicked) */}
          {Object.keys(accounts).map(serviceName => {
            const serviceAccounts = accounts[serviceName] || [];
            if (serviceAccounts.length === 0) return null;
            
            const rotateArrow = serviceAnimations[serviceName]?.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '180deg'],
            });
            
            return (
              <Animated.View 
                key={serviceName}
                style={[
                  styles.serviceDetailCard,
                  {
                    opacity: serviceAnimations[serviceName],
                    maxHeight: serviceAnimations[serviceName].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1000]
                    }),
                    marginTop: serviceAnimations[serviceName].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 10]
                    })
                  }
                ]}
              >
                <View style={styles.serviceDetailHeader}>
                  <Text style={styles.serviceDetailTitle}>
                    {serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Accounts
                  </Text>
                  <TouchableOpacity onPress={() => toggleServiceExpansion(serviceName)}>
                    <Ionicons name="close" size={22} color={colors.white} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.accountsList}>
                  {serviceAccounts.map(account => renderAccountItem(serviceName, account))}
                </View>
                
                <TouchableOpacity 
                  style={styles.addAccountButtonNew}
                  onPress={() => {
                    animateAddAccount(serviceName);
                    handleAddAccount(serviceName);
                  }}
                >
                  <Animated.View
                    style={{
                      transform: [
                        {
                          scale: addAccountAnimation.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 1.2, 1]
                          })
                        }
                      ]
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={18} color={colors.white} />
                  </Animated.View>
                  <Text style={styles.addAccountButtonText}>Add Another Account</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
          
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
      <ProfileEditModal />
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
    position: 'relative',
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
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  avatarEditBadge: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    backgroundColor: 'rgba(20, 32, 61, 0.9)',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
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
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  planBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    marginLeft: 6,
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
  errorContainer: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    marginLeft: spacing.sm,
  },
  retryButton: {
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.md,
  },
  retryText: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: 'rgba(20, 32, 61, 0.95)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(48, 109, 255, 0.3)',
    shadowColor: '#306DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalBody: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: 'rgba(16, 24, 44, 0.8)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderColor: 'rgba(48, 109, 255, 0.3)',
    borderWidth: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.white,
    marginBottom: spacing.md,
  },
  textAreaInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
  },
  saveButton: {
    backgroundColor: colors.emerald,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
  },
  emptyStateContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyStateHint: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  subscriptionCardContainer: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  subscriptionCard: {
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
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  subscriptionBadgeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    marginLeft: 4,
  },
  subscriptionFeatures: {
    padding: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  upgradePlanButton: {
    backgroundColor: colors.emerald,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  upgradePlanButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 32, 61, 0.6)',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(48, 109, 255, 0.2)',
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
  },
  clearButton: {
    padding: spacing.xs,
  },
  servicesGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  serviceCardNew: {
    width: '48%',
    backgroundColor: 'rgba(20, 32, 61, 0.8)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.sm,
    overflow: 'hidden',
    flexDirection: 'column',
    shadowColor: '#306DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  serviceCardContent: {
    flex: 1,
    marginBottom: spacing.sm,
  },
  serviceCardTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
    marginBottom: 2,
  },
  serviceCardSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  serviceCardAction: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  connectButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  connectButtonText: {
    color: colors.emerald,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  connectedText: {
    color: colors.emerald,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    marginLeft: 4,
  },
  serviceDetailCard: {
    backgroundColor: 'rgba(20, 32, 61, 0.85)',
    borderRadius: borderRadius.lg,
    borderColor: 'rgba(48, 109, 255, 0.15)',
    borderWidth: 1,
    shadowColor: '#306DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  serviceDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  serviceDetailTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
  },
  addAccountButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    margin: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
};

export default AccountScreen;
