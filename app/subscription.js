import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  Lightning, 
  Rocket, 
  Planet, 
  Buildings,
  CheckCircle,
  Check
} from 'phosphor-react-native';
import GradientBackground from '../components/GradientBackground';
import GlassCard from '../components/GlassCard';
import { colors, spacing } from '../constants/Theme';
import { layoutStyles, headerStyles, cardStyles, textStyles } from '../constants/StyleGuide';

const SubscriptionScreen = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    // In a real app, this would navigate to payment flow
    setTimeout(() => {
      // Placeholder for payment processing
      router.back();
    }, 500);
  };
  
  const handleEnterpriseContact = () => {
    Linking.openURL('mailto:enterprise@august.ai?subject=Enterprise%20Plan%20Inquiry');
  };
  
  const plans = [
    {
      id: 'nirvana',
      name: 'Nirvana',
      price: '$20',
      period: 'month',
      description: 'Perfect for personal use with essential features',
      icon: (props) => <Lightning {...props} />,
      color: colors.emerald,
      features: [
        '1,000 messages per month',
        'Access to core AI models',
        'Mobile app access',
        'Standard response time'
      ]
    },
    {
      id: 'eden',
      name: 'Eden',
      price: '$200',
      period: 'month',
      description: 'Advanced features for professionals',
      icon: (props) => <Rocket {...props} />,
      color: '#9F7AEA', // Purple
      features: [
        '20,000 messages per month',
        'Premium AI models',
        'Mobile & desktop access',
        'File uploads & analysis',
        'Priority response time'
      ]
    },
    {
      id: 'utopia',
      name: 'Utopia',
      price: '$2,000',
      period: 'month',
      description: 'Ultimate plan for power users and small teams',
      icon: (props) => <Planet {...props} />,
      color: '#F6AD55', // Orange
      features: [
        'Unlimited messages',
        'Access to all AI models',
        'Unlimited file uploads',
        'Team collaboration tools',
        'API access',
        'Dedicated support'
      ]
    }
  ];
  
  const renderPlanCard = (plan) => {
    const isSelected = selectedPlan === plan.id;
    const Icon = plan.icon;
    
    return (
      <TouchableOpacity
        key={plan.id}
        style={[styles.planCard, isSelected && styles.selectedPlanCard]}
        onPress={() => handleSelectPlan(plan.id)}
      >
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
          style={[styles.selectButton, {backgroundColor: plan.color}]}
          onPress={() => handleSelectPlan(plan.id)}
        >
          <Text style={styles.selectButtonText}>
            {isSelected ? 'Selected' : 'Select Plan'}
          </Text>
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
          
          {plans.map(renderPlanCard)}
          
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
              <Text style={styles.enterpriseFeatureItem}>• Custom integration</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleEnterpriseContact}
            >
              <Text style={styles.contactButtonText}>Contact Sales</Text>
            </TouchableOpacity>
          </GlassCard>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              All plans include a 14-day money-back guarantee
            </Text>
          </View>
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
  planCard: {
    backgroundColor: 'rgba(30, 30, 34, 0.7)',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedPlanCard: {
    borderColor: colors.emerald,
    borderWidth: 2,
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
  selectButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
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