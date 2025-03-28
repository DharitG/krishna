import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Linking, Alert } from 'react-native';
import Markdown from 'react-native-markdown-display';
import GlassCard from '../GlassCard';
import AuthButton from './AuthButton';
import AuthRedirect from './AuthRedirect';
import DynamicAuthBlob from '../../components/chat/DynamicAuthBlob';
import DynamicConfirmationBlob from '../../components/chat/DynamicConfirmationBlob';
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

const ChatMessage = ({ message, onAuthSuccess, index, isStreaming }) => {
  const isUser = message.role === 'user';
  const [authStates, setAuthStates] = useState({});
  const [showAuthRedirect, setShowAuthRedirect] = useState(false);
  const [serviceToAuth, setServiceToAuth] = useState(null);
  
  // Check if the message contains an auth redirect
  useEffect(() => {
    if (message.authRedirect) {
      setServiceToAuth(message.authRedirect.service);
      setShowAuthRedirect(true);
    }
  }, [message]);
  
  // Function to handle authentication
  const handleAuthenticate = async (service) => {
    console.log(`Starting authentication for service: ${service}`);
    setAuthStates(prev => ({
      ...prev,
      [service]: { isLoading: true }
    }));
    
    try {
      console.log(`Calling chatStore.authenticateService for ${service}`);
      const result = await chatStore.authenticateService(service);
      console.log(`Authentication result for ${service}:`, result);
      
      if (result.error) {
        console.error(`Authentication error for ${service}:`, result.message);
        setAuthStates(prev => ({
          ...prev,
          [service]: { isLoading: false, error: result.message }
        }));
        Alert.alert('Authentication Error', result.message || 'Failed to connect to service');
      } else if (result.redirectUrl) {
        console.log(`Got redirect URL for ${service}:`, result.redirectUrl);
        setServiceToAuth(service);
        setShowAuthRedirect(true);
        
        if (result.mockMode) {
          console.log(`Starting polling for ${service} (mock mode)`);
          startPollingAuthStatus(service);
        } else {
          console.log(`Opening redirect URL for ${service}:`, result.redirectUrl);
          Linking.openURL(result.redirectUrl);
        }
      } else {
        console.error(`No redirect URL for ${service}:`, result);
        setAuthStates(prev => ({
          ...prev,
          [service]: { isLoading: false, error: 'No redirect URL provided' }
        }));
        Alert.alert('Authentication Error', 'No redirect URL provided');
      }
    } catch (error) {
      console.error(`Error authenticating with ${service}:`, error);
      setAuthStates(prev => ({
        ...prev,
        [service]: { isLoading: false, error: error.message }
      }));
      Alert.alert('Authentication Error', error.message || 'An unexpected error occurred');
    }
  };
  
  // Poll for authentication status
  const startPollingAuthStatus = (service) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await chatStore.checkToolAuth(service);
        
        if (status.authenticated) {
          clearInterval(pollInterval);
          handleAuthComplete(service);
        }
      } catch (error) {
        console.error('Error polling auth status:', error);
      }
    }, 2000);
    
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 60000);
  };
  
  // Handle authentication completion
  const handleAuthComplete = (service) => {
    setShowAuthRedirect(false);
    setServiceToAuth(null);
    
    setAuthStates(prev => ({
      ...prev,
      [service]: { isLoading: false, isAuthenticated: true }
    }));
    
    if (onAuthSuccess) {
      onAuthSuccess(service);
    }
  };
  
  // Handle authentication cancellation
  const handleAuthCancel = () => {
    setShowAuthRedirect(false);
    setServiceToAuth(null);
    
    if (serviceToAuth) {
      setAuthStates(prev => ({
        ...prev,
        [serviceToAuth]: { isLoading: false, isAuthenticated: false }
      }));
    }
  };
  
  // Markdown styles
  const markdownStyles = {
    body: {
      color: isUser ? colors.text.inverse : colors.text.primary,
      fontSize: typography.fontSize.md,
      lineHeight: typography.lineHeight.md,
    },
    heading1: {
      color: isUser ? colors.text.inverse : colors.text.primary,
      fontSize: typography.fontSize.xl,
      fontWeight: 'bold',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    heading2: {
      color: isUser ? colors.text.inverse : colors.text.primary,
      fontSize: typography.fontSize.lg,
      fontWeight: 'bold',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    heading3: {
      color: isUser ? colors.text.inverse : colors.text.primary,
      fontSize: typography.fontSize.md,
      fontWeight: 'bold',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    paragraph: {
      marginVertical: spacing.xs,
    },
    list_item: {
      marginVertical: spacing.xs / 2,
    },
    code_block: {
      backgroundColor: colors.background.tertiary,
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      fontFamily: typography.fontFamily.mono,
      fontSize: typography.fontSize.sm,
    },
    code_inline: {
      backgroundColor: colors.background.tertiary,
      padding: spacing.xs,
      borderRadius: borderRadius.sm,
      fontFamily: typography.fontFamily.mono,
      fontSize: typography.fontSize.sm,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.interactive.primary,
      paddingLeft: spacing.md,
      marginLeft: spacing.sm,
      opacity: 0.8,
    },
    link: {
      color: colors.interactive.primary,
      textDecorationLine: 'underline',
    },
    hr: {
      backgroundColor: colors.border.primary,
      height: 1,
      marginVertical: spacing.md,
    },
    table: {
      borderWidth: 1,
      borderColor: colors.border.primary,
      borderRadius: borderRadius.sm,
      marginVertical: spacing.md,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: colors.border.primary,
    },
    th: {
      padding: spacing.sm,
      backgroundColor: colors.background.tertiary,
    },
    td: {
      padding: spacing.sm,
    },
  };
  
  // Function to parse message content and render auth buttons
  const renderMessageContent = (content) => {
    if (showAuthRedirect && serviceToAuth) {
      return (
        <AuthRedirect
          serviceName={serviceToAuth}
          onAuthComplete={handleAuthComplete}
          onCancel={handleAuthCancel}
        />
      );
    }
    
    if (!content || !content.includes('[AUTH_REQUEST:')) {
      return (
        <Markdown style={markdownStyles}>
          {content}
        </Markdown>
      );
    }
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = AUTH_REQUEST_PATTERN.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      parts.push({
        type: 'auth',
        service: match[1]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }
    
    return (
      <View>
        {parts.map((part, i) => {
          if (part.type === 'text') {
            return (
              <Markdown key={i} style={markdownStyles}>
                {part.content}
              </Markdown>
            );
          } else if (part.type === 'auth') {
            const service = part.service;
            const authState = authStates[service] || {};
            
            return (
              <DynamicAuthBlob
                key={i}
                service={service}
                isLoading={authState.isLoading}
                isConnected={authState.isAuthenticated}
                error={authState.error}
                onAuthenticate={() => handleAuthenticate(service)}
                onErrorDismiss={() => {
                  setAuthStates(prev => ({
                    ...prev,
                    [service]: { ...prev[service], error: null }
                  }));
                }}
              />
            );
          }
        })}
      </View>
    );
  };
  
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.botContainer
    ]}>
      {isUser ? (
        <GlassCard style={[styles.bubble, styles.userBubble]}>
          {renderMessageContent(message.content)}
        </GlassCard>
      ) : (
        <View style={[styles.botMessageContainer]}>
          {renderMessageContent(message.content)}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
    marginVertical: spacing.xs / 2,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  botContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  bubble: {
    maxWidth: '85%',
    ...shadows.md,
  },
  userBubble: {
    backgroundColor: colors.buttonBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    elevation: 3,
    shadowColor: colors.buttonBackground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  botMessageContainer: {
    width: '100%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  text: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
  },
  userText: {
    color: colors.text.primary,
  },
  botText: {
    color: colors.text.primary,
  },
});

export default ChatMessage;
