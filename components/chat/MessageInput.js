import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Keyboard,
  Dimensions,
  LayoutAnimation,
  UIManager,
  SafeAreaView,
  Alert
} from 'react-native';
import { Plus, ArrowUp } from 'phosphor-react-native';
import { colors } from '../../constants/Theme';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import supabase from '../../services/supabase';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MessageInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);
  const [memoryPreferences, setMemoryPreferences] = useState({
    enabled: true,
    contextData: true,
    location: false,
    deviceInfo: true
  });
  const inputRef = useRef(null);
  const { height: screenHeight } = Dimensions.get('window');

  // Monitor keyboard visibility and height
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Load memory preferences
  useEffect(() => {
    const loadMemoryPreferences = async () => {
      try {
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
        setMemoryPreferences({
          enabled: memoryPrefs.enabled !== false, // Default to true
          contextData: memoryPrefs.contextData !== false, // Default to true
          location: memoryPrefs.location === true, // Default to false
          deviceInfo: memoryPrefs.deviceInfo !== false // Default to true
        });
      } catch (error) {
        console.error('Error loading memory preferences:', error);
      }
    };

    loadMemoryPreferences();
  }, []);

  const handleSend = async () => {
    if (message.trim().length > 0) {
      // Prepare contextual data if enabled
      let contextData = {};

      if (memoryPreferences.enabled && memoryPreferences.contextData) {
        // Add timestamp and timezone
        contextData.temporal = {
          timestamp: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        // Add device info if enabled
        if (memoryPreferences.deviceInfo) {
          contextData.device = {
            type: Platform.OS,
            os: Platform.OS === 'ios' ? `iOS ${Platform.Version}` : `Android ${Platform.Version}`,
            model: Platform.OS === 'ios' ? 'iPhone' : 'Android Device'
          };
        }

        // Add location if enabled
        if (memoryPreferences.location) {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status === 'granted') {
              const location = await Location.getCurrentPositionAsync({});
              contextData.geospatial = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              };
            }
          } catch (error) {
            console.error('Error getting location:', error);
          }
        }
      }

      // Send message with context data
      onSendMessage(message, contextData);
      setMessage('');
    }
  };

  // Handle input layout to calculate its height
  const onInputLayout = (event) => {
    setInputHeight(event.nativeEvent.layout.height);
  };

  return (
    <SafeAreaView>
      <View
        style={[
          styles.container,
          keyboardVisible && Platform.OS === 'android' && styles.containerWithKeyboard
        ]}
        onLayout={onInputLayout}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Message August"
          placeholderTextColor="#8BAEDC"
          value={message}
          onChangeText={setMessage}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          multiline
        />

        <View style={styles.actions}>
          <TouchableOpacity style={styles.button}>
            <Plus size={24} color="#8BAEDC" weight="bold" />
          </TouchableOpacity>

          {isLoading ? (
            <View style={styles.sendButton}>
              <ActivityIndicator color="#fff" size="small" />
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: message.trim().length > 0 ? '#1D4ED8' : '#173A63' }
              ]}
              onPress={handleSend}
              disabled={message.trim().length === 0}
            >
              <ArrowUp size={24} color="#fff" weight="bold" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0C1B3B',
    padding: 12,
    margin: 16,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80, // Double height
  },
  containerWithKeyboard: {
    position: 'relative',
    bottom: 0,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    minHeight: 60, // Increased height for input
    maxHeight: 120, // Maximum height for multiline
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
    alignItems: 'center',
    gap: 8,
  },
  button: {
    backgroundColor: '#173A63',
    padding: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
  },
  sendButton: {
    backgroundColor: '#1D4ED8',
    padding: 8,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
  },
});

export default MessageInput;
