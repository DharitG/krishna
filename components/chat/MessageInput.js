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
  SafeAreaView
} from 'react-native';
import { Plus, ArrowUp } from 'phosphor-react-native';
import { colors } from '../../constants/Theme';

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
