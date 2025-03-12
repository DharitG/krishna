import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../constants/Theme';
import { layoutStyles, headerStyles, cardStyles, textStyles } from '../../constants/StyleGuide';

const SettingsScreen = () => {
  const router = useRouter();
  
  const handleBack = () => {
    router.back();
  };
  
  // These would be connected to real settings in a full app
  const settings = [
    {
      title: 'General',
      items: [
        { label: 'API Key', icon: 'key-outline', hasDetail: true, value: '••••••••••••••••' },
        { label: 'Theme', icon: 'color-palette-outline', hasDetail: true, value: 'Dark' },
        { label: 'Sign Out', icon: 'log-out-outline', hasDetail: false },
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
        { label: 'Current Plan', icon: 'ribbon-outline', hasDetail: true, value: 'Nirvana' },
        { label: 'Manage Subscription', icon: 'card-outline', hasDetail: true },
        { label: 'Upgrade', icon: 'arrow-up-circle-outline', hasDetail: true },
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
            <Text style={headerStyles.headerTitleLarge}>Settings</Text>
          </View>
          
          <View style={headerStyles.headerRight} />
        </View>
        
        <ScrollView 
          style={layoutStyles.container} 
          contentContainerStyle={layoutStyles.contentContainer}
        >
          {settings.map((section, sectionIndex) => (
            <View key={sectionIndex} style={layoutStyles.section}>
              <Text style={textStyles.sectionTitle}>{section.title}</Text>
              
              <GlassCard style={cardStyles.glassCard}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity 
                    key={itemIndex} 
                    style={[
                      cardStyles.cardItem,
                      itemIndex === section.items.length - 1 ? cardStyles.cardItemLast : null
                    ]}
                  >
                    <View style={cardStyles.cardItemLeft}>
                      <Ionicons 
                        name={item.icon} 
                        size={22} 
                        color={colors.emerald} 
                        style={cardStyles.cardItemIcon} 
                      />
                      <Text style={cardStyles.cardItemLabel}>{item.label}</Text>
                    </View>
                    
                    <View style={cardStyles.cardItemRight}>
                      {item.value && <Text style={cardStyles.cardItemValue}>{item.value}</Text>}
                      {item.hasDetail && <Ionicons name="chevron-forward" size={18} color={colors.lightGray} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </GlassCard>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

// We're using the StyleGuide.js for all styles now

export default SettingsScreen;