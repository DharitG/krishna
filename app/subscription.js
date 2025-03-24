import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  StyleSheet,
  Image,
  Linking,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  Lightning, 
  Rocket, 
  Planet, 
  Buildings,
  CheckCircle,
  Check,
  ArrowClockwise
} from 'phosphor-react-native';
import GradientBackground from '../components/GradientBackground';
import GlassCard from '../components/GlassCard';
import { colors, spacing } from '../constants/Theme';
import { layoutStyles, headerStyles, cardStyles, textStyles } from '../constants/StyleGuide';
import { useAuth } from '../services/authContext';
import revenueCatService from '../services/revenueCatService';

const SubscriptionScreen = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('free');
  
  const { subscribeToPlan, restorePurchases, getCurrentPlan, subscription, isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    const initRevenueCat = async () => {
      setLoading(true);
      try {
        // Fetch available offerings from RevenueCat
        const rcOfferings = await revenueCatService.getOfferings();
        setOfferings(rcOfferings);
        
        // Set current plan
        if (isAuthenticated) {
          const plan = getCurrentPlan();
          setCurrentPlan(plan);
        }
      } catch (error) {
        console.error('Error fetching offerings:', error);
        Alert.alert('Error', 'Failed to load subscription options');
      } finally {
        setLoading(false);
      }
    };
    
    initRevenueCat();
  }, [isAuthenticated, subscription]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleSelectPlan = async (planId) => {
    try {
      if (!isAuthenticated) {
        Alert.alert('Sign In Required', 'Please sign in to subscribe to a plan');
        router.push('/auth/login');
        return;
      }
      
      setSelectedPlan(planId);
      
      // Get the correct offering
      const offering = offerings?.current;
      if (!offering) {
        throw new Error('No offerings available');
      }
      
      // Find the package that matches the selected plan
      let packageToPurchase;
      if (planId === 'eden') {
        packageToPurchase = offering.availablePackages.find(
          pkg => pkg.identifier === 'monthly' && pkg.product.identifier.includes('eden')
        );
      } else if (planId === 'utopia') {
        packageToPurchase = offering.availablePackages.find(
          pkg => pkg.identifier === 'monthly' && pkg.product.identifier.includes('utopia')
        );
      }
      
      if (!packageToPurchase) {
        throw new Error(`Subscription package for ${planId} not found`);
      }
      
      // Purchase the package
      await subscribeToPlan(packageToPurchase);
      
      // Update current plan
      setCurrentPlan(getCurrentPlan());
      
      Alert.alert('Success', `You are now subscribed to the ${planId} plan!`);
    } catch (error) {
      if (!error.userCancelled) {
        Alert.alert('Subscription Error', error.message);
      }
    } finally {
      setSelectedPlan(null);
    }
  };
  
  const handleRestorePurchases = async () => {
    try {
      if (!isAuthenticated) {
        Alert.alert('Sign In Required', 'Please sign in to restore your purchases');
        router.push('/auth/login');
        return;
      }
      
      setLoading(true);
      const result = await restorePurchases();
      
      // Update current plan
      setCurrentPlan(getCurrentPlan());
      
      Alert.alert('Success', 'Your purchases have been restored successfully');
    } catch (error) {
      Alert.alert('Restore Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEnterpriseContact = () => {
    Linking.openURL('mailto:enterprise@august.ai?subject=Enterprise%20Plan%20Inquiry');
  };
  
  const plans = [
    {
      id: 'eden',
      name: 'Eden',
      price: '$20',
      period: 'month',
      description: 'Perfect for personal use with essential features',
      icon: (props) => <Lightning {...props} />,
      color: colors.emerald,
      features: [
        '10x more requests than free plan',
        'SOTA AI models with significantly higher accuracy than free',
        'Manage 10x more accounts than free',
        'Standard response time'
      ]
    },
    {
      id: 'utopia',
      name: 'Utopia',
      price: '$50',
      period: 'month',
      description: 'Advanced features for professionals',
      icon: (props) => <Rocket {...props} />,
      color: '#9F7AEA', // Purple
      features: [
        'Unlimited requests',
        'SOTA AI models with significantly higher accuracy than free',
        'Unlimited accounts',
        'File uploads & analysis',
        'Priority response time',
        'Enhanced security features'
      ]
    }
  ];
  
  const renderPlanCard = (plan) => {
    const isSelected = selectedPlan === plan.id;
    const isActive = currentPlan === plan.id;
    const Icon = plan.icon;
    
    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard, 
          isSelected && styles.selectedPlanCard,
          isActive && styles.activePlanCard
        ]}
        onPress={() => handleSelectPlan(plan.id)}
        disabled={isActive || loading}
      >
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Current Plan</Text>
          </View>
        )}
        
        <View style={[styles.planIconContainer, {backgroundColor: plan.color}]}>
          <Icon size={28} color={colors.white} weight="fill" />
        </View>
        
        <Text style={styles.planName}>{plan.name}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.planPrice}>{plan.price}</Text>
          <Text style={styles.planPeriod}>/{plan.period}</Text>
        </View>
        
        <Text style={styles.planDescription}>{plan.description}</Text>
        
        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Check size={18} color={colors.emerald} weight="bold" style={styles.featureIcon} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.selectButton, 
            {backgroundColor: plan.color},
            isActive && styles.currentPlanButton
          ]}
          onPress={() => handleSelectPlan(plan.id)}
          disabled={isActive || loading}
        >
          {isSelected && loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.selectButtonText}>
              {isActive ? 'Current Plan' : (isSelected ? 'Processing...' : 'Select Plan')}
            </Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  
  return (
    <GradientBackground colors={[colors.black, colors.darkGray]}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={layoutStyles.safeArea}>
        <View style={headerStyles.headerWithBack}>
          <TouchableOpacity 
            style={headerStyles.headerLeft} 
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={headerStyles.headerCenter}>
            <Text style={headerStyles.headerTitleLarge}>Subscription Plans</Text>
          </View>
          
          <View style={headerStyles.headerRight} />
        </View>
        
        <ScrollView 
          style={layoutStyles.container} 
          contentContainerStyle={[layoutStyles.contentContainer, styles.scrollContent]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.tagline}>
            Unlock the full power of August AI
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.emerald} />
              <Text style={styles.loadingText}>Loading subscription plans...</Text>
            </View>
          ) : (
            <>
              {plans.map(renderPlanCard)}
              
              <TouchableOpacity 
                style={styles.restoreButton}
                onPress={handleRestorePurchases}
              >
                <ArrowClockwise size={20} color={colors.lightGray} />
                <Text style={styles.restoreButtonText}>Restore Purchases</Text>
              </TouchableOpacity>
              
              <GlassCard style={styles.enterpriseCard}>
                <View style={styles.enterpriseHeader}>
                  <Buildings size={28} color={colors.white} weight="fill" />
                  <Text style={styles.enterpriseTitle}>Enterprise</Text>
                </View>
                
                <Text style={styles.enterpriseDescription}>
                  Custom solutions for large organizations with advanced needs
                </Text>
                
                <View style={styles.enterpriseFeatures}>
                  <Text style={styles.enterpriseFeatureItem}>• Custom AI model training</Text>
                  <Text style={styles.enterpriseFeatureItem}>• Advanced security & compliance</Text>
                  <Text style={styles.enterpriseFeatureItem}>• Dedicated account management</Text>
                  <Text style={styles.enterpriseFeatureItem}>• Custom integrations</Text>
                  <Text style={styles.enterpriseFeatureItem}>• Personalized support</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={handleEnterpriseContact}
                >
                  <Text style={styles.contactButtonText}>Contact Sales</Text>
                </TouchableOpacity>
              </GlassCard>
              
              {!isAuthenticated && (
                <View style={styles.unauthenticatedNote}>
                  <Text style={styles.unauthenticatedText}>
                    Sign in to subscribe or restore purchases
                  </Text>
                  <TouchableOpacity 
                    onPress={() => router.push('/auth/login')}
                    style={styles.signInButton}
                  >
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    padding: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.lightGray,
    marginTop: spacing.md,
    fontSize: 16,
  },
  planCard: {
    backgroundColor: 'rgba(30, 30, 34, 0.7)',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: colors.emerald,
    borderWidth: 2,
  },
  activePlanCard: {
    borderColor: '#9F7AEA', // Purple
    borderWidth: 2,
  },
  activeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#9F7AEA', // Purple
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    zIndex: 10,
  },
  activeBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  planIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  planPeriod: {
    fontSize: 16,
    color: colors.lightGray,
    marginLeft: 2,
  },
  planDescription: {
    fontSize: 14,
    color: colors.lightGray,
    marginBottom: spacing.md,
  },
  featuresContainer: {
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  featureIcon: {
    marginRight: spacing.xs,
  },
  featureText: {
    fontSize: 14,
    color: colors.white,
  },
  selectButton: {
    paddingVertical: spacing.md,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: 'rgba(159, 122, 234, 0.5)', // Purple with opacity
  },
  selectButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.sm,
  },
  restoreButtonText: {
    color: colors.lightGray,
    marginLeft: spacing.xs,
    fontSize: 14,
  },
  enterpriseCard: {
    padding: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: 'rgba(30, 30, 34, 0.7)',
  },
  enterpriseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  enterpriseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.md,
  },
  enterpriseDescription: {
    fontSize: 14,
    color: colors.lightGray,
    marginBottom: spacing.md,
  },
  enterpriseFeatures: {
    marginBottom: spacing.lg,
  },
  enterpriseFeatureItem: {
    fontSize: 14,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  contactButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButtonText: {
    color: colors.black,
    fontWeight: 'bold',
    fontSize: 16,
  },
  unauthenticatedNote: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: 'rgba(20, 20, 24, 0.8)',
    alignItems: 'center',
  },
  unauthenticatedText: {
    color: colors.lightGray,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  signInButton: {
    backgroundColor: colors.emerald,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  signInButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.lightGray,
    textAlign: 'center',
  }
});

export default SubscriptionScreen;