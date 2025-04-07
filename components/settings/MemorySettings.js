import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, glassMorphism, borderRadius } from '../../constants/Theme';
import GlassCard from '../GlassCard';
import supabase from '../../services/supabase';

const MemorySettings = () => {
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [contextDataEnabled, setContextDataEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [deviceInfoEnabled, setDeviceInfoEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('No authenticated user found');
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error loading preferences:', error);
          return;
        }
        
        // Set memory preferences from user profile
        const memoryPrefs = data?.preferences?.memory || {};
        setMemoryEnabled(memoryPrefs.enabled !== false); // Default to true
        setContextDataEnabled(memoryPrefs.contextData !== false); // Default to true
        setLocationEnabled(memoryPrefs.location === true); // Default to false
        setDeviceInfoEnabled(memoryPrefs.deviceInfo !== false); // Default to true
      } catch (error) {
        console.error('Error in loadPreferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, []);

  // Save preferences when they change
  const savePreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }
      
      // Get current preferences
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading current preferences:', error);
        return;
      }
      
      // Update memory preferences
      const currentPreferences = data?.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        memory: {
          enabled: memoryEnabled,
          contextData: contextDataEnabled,
          location: locationEnabled,
          deviceInfo: deviceInfoEnabled
        }
      };
      
      // Save updated preferences
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ preferences: updatedPreferences })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error saving preferences:', updateError);
        Alert.alert('Error', 'Failed to save memory preferences');
      }
    } catch (error) {
      console.error('Error in savePreferences:', error);
      Alert.alert('Error', 'Failed to save memory preferences');
    }
  };

  // Save preferences when they change
  useEffect(() => {
    if (!isLoading) {
      savePreferences();
    }
  }, [memoryEnabled, contextDataEnabled, locationEnabled, deviceInfoEnabled]);

  // Handle memory reset
  const handleResetMemory = async () => {
    Alert.alert(
      'Reset Memory',
      'Are you sure you want to delete all your memory data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              
              if (!user) {
                throw new Error('No authenticated user found');
              }
              
              const response = await fetch(`${process.env.BACKEND_URL}/api/memory`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${user.id}`
                }
              });
              
              if (!response.ok) {
                throw new Error('Failed to reset memory data');
              }
              
              Alert.alert('Success', 'Your memory data has been reset successfully.');
            } catch (error) {
              console.error('Error resetting memory:', error);
              Alert.alert('Error', 'Failed to reset memory data');
            }
          }
        }
      ]
    );
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="brain" size={24} color={colors.primary} />
        <Text style={styles.title}>Memory Settings</Text>
      </View>
      
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Enable Memory</Text>
          <Text style={styles.settingDescription}>
            Allow August to remember information from your conversations
          </Text>
        </View>
        <Switch
          value={memoryEnabled}
          onValueChange={setMemoryEnabled}
          trackColor={{ false: colors.darkGray, true: colors.primary }}
          thumbColor={colors.white}
        />
      </View>
      
      {memoryEnabled && (
        <>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Context Data</Text>
              <Text style={styles.settingDescription}>
                Include time and other contextual information
              </Text>
            </View>
            <Switch
              value={contextDataEnabled}
              onValueChange={setContextDataEnabled}
              trackColor={{ false: colors.darkGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Location Data</Text>
              <Text style={styles.settingDescription}>
                Include your approximate location
              </Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: colors.darkGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Device Information</Text>
              <Text style={styles.settingDescription}>
                Include device and browser information
              </Text>
            </View>
            <Switch
              value={deviceInfoEnabled}
              onValueChange={setDeviceInfoEnabled}
              trackColor={{ false: colors.darkGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleResetMemory}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={styles.resetButtonText}>Reset Memory Data</Text>
          </TouchableOpacity>
        </>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
    padding: spacing.md
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  title: {
    ...typography.h3,
    color: colors.white,
    marginLeft: spacing.sm
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkGray
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md
  },
  settingTitle: {
    ...typography.subtitle,
    color: colors.white
  },
  settingDescription: {
    ...typography.body,
    color: colors.lightGray,
    fontSize: 12
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.darkGray
  },
  resetButtonText: {
    ...typography.button,
    color: colors.error,
    marginLeft: spacing.xs
  }
});

export default MemorySettings;
