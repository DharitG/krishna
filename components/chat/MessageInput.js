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
  UIManager
} from 'react-native';
import { ArrowUp, Plus } from 'phosphor-react-native';
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography
} from '../../constants/Theme';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MessageInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);
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

  const handleSend = () => {
    if (message.trim().length > 0) {
      onSendMessage(message);
      setMessage('');
    }
  };

  // Handle attachments
  const handleAttachment = () => {
    // This would open attachment options
    console.log('Open attachment options');
  };

  // Handle input layout to calculate its height
  const onInputLayout = (event) => {
    setInputHeight(event.nativeEvent.layout.height);
  };

  // Focus the input when needed
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <View 
      style={[
        styles.container,
        keyboardVisible && { 
          bottom: Platform.OS === 'ios' ? 0 : 'auto',
          position: Platform.OS === 'ios' ? 'absolute' : 'relative',
          transform: [{ translateY: Platform.OS === 'android' && keyboardVisible ? -10 : 0 }]
        }
      ]}
      onLayout={onInputLayout}
    >
      <View style={styles.inputArea}>
        <TextInput
          ref={inputRef}
          style={styles.integrated}
          value={message}
          onChangeText={setMessage}
          placeholder="Message August"
          placeholderTextColor="rgba(255, 255, 255, 0.7)"
          multiline
          maxHeight={100}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={handleAttachment}
          >
            <Plus 
              size={24} 
              color={colors.white} 
              weight="bold" 
            />
          </TouchableOpacity>
          
          {isLoading ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator color={colors.emerald} size="small" />
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.sendButton, 
                { backgroundColor: message.trim().length > 0 ? colors.emerald : colors.gray }
              ]}
              onPress={handleSend}
              disabled={message.trim().length === 0}
            >
              <ArrowUp
                size={24}
                color={colors.white}
                weight="bold"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    backgroundColor: 'rgba(40, 40, 45, 0.98)', // Lighter background for more contrast
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...shadows.lg,
    zIndex: 10,
    elevation: 5, // For Android shadow
  },
  containerWithKeyboard: {
    position: 'relative', // Change from absolute to relative when keyboard is visible on Android
    bottom: 0,
  },
  inputArea: {
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Extra padding for bottom safe area
  },
  integrated: {
    fontSize: typography.fontSize.lg,
    fontFamily: 'Roboto',
    color: colors.white,
    maxHeight: 100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    lineHeight: typography.lineHeight.lg,
    letterSpacing: 0.2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  attachButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(55, 55, 65, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.sm,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
    borderRadius: borderRadius.round,
    ...shadows.sm,
  },
  loadingButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
  },
});

export default MessageInput;