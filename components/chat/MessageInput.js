import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { ArrowUp, Plus } from 'phosphor-react-native';
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography
} from '../../constants/Theme';

const MessageInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

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

  return (
    <View style={styles.container}>
      <View style={styles.inputArea}>
        <TextInput
          style={styles.integrated}
          value={message}
          onChangeText={setMessage}
          placeholder="Message August"
          placeholderTextColor="rgba(255, 255, 255, 0.7)"
          multiline
          maxHeight={100}
          returnKeyType="send"
          onSubmitEditing={handleSend}
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
    backgroundColor: 'rgba(30, 30, 35, 0.98)', // Lighter than the chat area for distinction
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...shadows.lg,
  },
  inputArea: {
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Extra padding for bottom safe area
  },
  integrated: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    maxHeight: 100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
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