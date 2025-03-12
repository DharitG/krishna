import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ArrowUp } from 'phosphor-react-native';
import GlassCard from '../GlassCard';
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

  return (
    <GlassCard style={styles.container}>
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message..."
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        multiline
        maxHeight={100}
        returnKeyType="send"
        onSubmitEditing={handleSend}
      />
      
      {isLoading ? (
        <View style={styles.loadingButton}>
          <ActivityIndicator color={colors.emerald} size="small" />
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.sendButtonContainer, 
            styles.sendButton, 
            { backgroundColor: message.trim().length > 0 ? colors.emerald : colors.gray }
          ]}
          onPress={handleSend}
          disabled={message.trim().length === 0}
        >
          <ArrowUp
            size={20}
            color={colors.white}
            weight="bold"
          />
        </TouchableOpacity>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(30, 30, 34, 0.8)',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.white,
    maxHeight: 100,
  },
  sendButtonContainer: {
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
  },
  loadingButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
});

export default MessageInput;