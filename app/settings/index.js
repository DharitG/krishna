import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  // These would be connected to real settings in a full app
  const settings = [
    {
      title: 'General',
      items: [
        { label: 'API Key', icon: 'key-outline', hasDetail: true, value: '••••••••••••••••' },
        { label: 'Theme', icon: 'color-palette-outline', hasDetail: true, value: 'Light' },
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
      title: 'About',
      items: [
        { label: 'Version', icon: 'information-circle-outline', hasDetail: true, value: '1.0.0' },
        { label: 'Terms of Service', icon: 'document-text-outline', hasDetail: true },
        { label: 'Privacy Policy', icon: 'shield-outline', hasDetail: true },
      ]
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        
        {settings.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity 
                  key={itemIndex} 
                  style={[
                    styles.item,
                    itemIndex === section.items.length - 1 ? styles.lastItem : null
                  ]}
                >
                  <View style={styles.itemLeft}>
                    <Ionicons name={item.icon} size={22} color="#007AFF" style={styles.itemIcon} />
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </View>
                  
                  <View style={styles.itemRight}>
                    {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
                    {item.hasDetail && <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#3A3A3C',
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
    color: '#000',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 6,
  },
});

export default SettingsScreen;