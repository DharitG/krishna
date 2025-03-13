import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '../GlassCard';
import AuthButton from './AuthButton';
import chatStore from '../../services/chatStore';
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography
} from '../../constants/Theme';

// Regex pattern to detect auth requests in the message
// Format: [AUTH_REQUEST:service]
const AUTH_REQUEST_PATTERN = /\[AUTH_REQUEST:(\w+)\]/g;

const ChatMessage = ({ message, onAuthSuccess }) => {
  const isUser = message.role === 'user';
  const [authStates, setAuthStates] = useState({});
  
  // Function to handle authentication
  const handleAuth = async (service) => {
    // Update loading state
    setAuthStates(prev => ({
      ...prev,
      [service]: { isLoading: true }
    }));
    
    try {
      // Request authentication via chatStore
      const result = await chatStore.authenticateService(service);
      
      if (result.error) {
        // Set error state
        setAuthStates(prev => ({
          ...prev,
          [service]: { isLoading: false, error: result.message }
        }));
      } else if (result.redirectUrl) {
        // Open the authentication URL
        // Note: In a real implementation, you would use Linking.openURL()
        // and handle the return process properly
        console.log(`Opening URL: ${result.redirectUrl}`);
        
        // For now, we'll simulate a successful authentication after a delay
        setTimeout(() => {
          setAuthStates(prev => ({
            ...prev,
            [service]: { isLoading: false, isAuthenticated: true }
          }));
          
          // Notify parent component of auth success
          if (onAuthSuccess) {
            onAuthSuccess(service);
          }
        }, 2000);
      }
    } catch (error) {
      setAuthStates(prev => ({
        ...prev,
        [service]: { isLoading: false, error: error.message }
      }));
    }
  };
  
  // Function to parse message content and render auth buttons
  const renderMessageContent = (content) => {
    if (!content.includes('[AUTH_REQUEST:')) {
      // No auth requests in this message, just return the text
      return <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>{content}</Text>;
    }
    
    // Split the content into parts
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // Reset the regex to start from the beginning
    AUTH_REQUEST_PATTERN.lastIndex = 0;
    
    // Find all auth requests in the content
    while ((match = AUTH_REQUEST_PATTERN.exec(content)) !== null) {
      const service = match[1];
      
      // Add text before the auth request
      if (match.index > lastIndex) {
        parts.push(
          <Text key={`text-${lastIndex}`} style={[styles.text, isUser ? styles.userText : styles.botText]}>
            {content.slice(lastIndex, match.index)}
          </Text>
        );
      }
      
      // Add the auth button
      parts.push(
        <AuthButton
          key={`auth-${match.index}`}
          service={service}
          onPress={() => handleAuth(service)}
          isLoading={authStates[service]?.isLoading}
          isAuthenticated={authStates[service]?.isAuthenticated}
          error={authStates[service]?.error}
        />
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text after the last auth request
    if (lastIndex < content.length) {
      parts.push(
        <Text key={`text-${lastIndex}`} style={[styles.text, isUser ? styles.userText : styles.botText]}>
          {content.slice(lastIndex)}
        </Text>
      );
    }
    
    return parts;
  };
  
  if (isUser) {
    return (
      <View style={[styles.container, styles.userContainer]}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={[styles.text, styles.userText]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, styles.botContainer]}>
      <GlassCard style={[styles.bubble, styles.botBubble]}>
        {renderMessageContent(message.content)}
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  botContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    maxWidth: '85%',
    ...shadows.sm,
  },
  userBubble: {
    borderBottomRightRadius: spacing.xs,
    backgroundColor: colors.emerald,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  botBubble: {
    borderBottomLeftRadius: spacing.xs,
    backgroundColor: 'rgba(45, 45, 52, 0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  text: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
  },
  userText: {
    color: colors.white,
  },
  botText: {
    color: colors.white,
  },
});

export default ChatMessage;