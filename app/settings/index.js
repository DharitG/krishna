import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/Theme';

const SettingsScreen = () => {
  // These would be connected to real settings in a full app
  const settings = [
    {
      title: 'General',
      items: [
        { label: 'API Key', icon: 'key-outline', hasDetail: true, value: '••••••••••••••••' },
        { label: 'Theme', icon: 'color-palette-outline', hasDetail: true, value: 'Dark' },
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {settings.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              
              <GlassCard style={styles.sectionContent}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity 
                    key={itemIndex} 
                    style={[
                      styles.item,
                      itemIndex === section.items.length - 1 ? styles.lastItem : null
                    ]}
                  >
                    <View style={styles.itemLeft}>
                      <Ionicons name={item.icon} size={22} color={colors.emerald} style={styles.itemIcon} />
                      <Text style={styles.itemLabel}>{item.label}</Text>
                    </View>
                    
                    <View style={styles.itemRight}>
                      {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    paddingTop: Platform.OS === 'android' ? spacing.xl : spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  sectionContent: {
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: spacing.md,
  },
  itemLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.white,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: typography.fontSize.md,
    color: colors.lightGray,
    marginRight: spacing.xs,
  },
});

export default SettingsScreen;