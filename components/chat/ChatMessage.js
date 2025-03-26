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
    // Set loading state
    setAuthStates(prev => ({
      ...prev,
      [service]: { isLoading: true }
    }));
    
    try {
      // Request authentication via chatStore
      console.log(`Calling chatStore.authenticateService for ${service}`);
      const result = await chatStore.authenticateService(service);
      console.log(`Authentication result for ${service}:`, result);
      
      if (result.error) {
        console.error(`Authentication error for ${service}:`, result.message);
        // Set error state
        setAuthStates(prev => ({
          ...prev,
          [service]: { isLoading: false, error: result.message }
        }));
        // Show error alert
        Alert.alert('Authentication Error', result.message || 'Failed to connect to service');
      } else if (result.redirectUrl) {
        console.log(`Got redirect URL for ${service}:`, result.redirectUrl);
        // Open the authentication URL
        setServiceToAuth(service);
        setShowAuthRedirect(true);
        
        // Start polling for auth status if we're in mock mode
        if (result.mockMode) {
          console.log(`Starting polling for ${service} (mock mode)`);
          startPollingAuthStatus(service);
        } else {
          // Open the URL directly for real OAuth flow
          console.log(`Opening redirect URL for ${service}:`, result.redirectUrl);
          Linking.openURL(result.redirectUrl);
        }
      } else {
        console.error(`No redirect URL for ${service}:`, result);
        // No redirect URL and no error - this is unexpected
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
    }, 2000); // Poll every 2 seconds
    
    // Store the interval ID to clear it later
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 60000); // Stop polling after 1 minute
  };
  
  // Handle authentication completion
  const handleAuthComplete = (service) => {
    setShowAuthRedirect(false);
    setServiceToAuth(null);
    
    // Update auth state
    setAuthStates(prev => ({
      ...prev,
      [service]: { isLoading: false, isAuthenticated: true }
    }));
    
    // Notify parent component of auth success
    if (onAuthSuccess) {
      onAuthSuccess(service);
    }
  };
  
  // Handle authentication cancellation
  const handleAuthCancel = () => {
    setShowAuthRedirect(false);
    setServiceToAuth(null);
    
    // Update auth state
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
      color: isUser ? colors.black : colors.white,
      fontSize: typography.fontSize.md,
      lineHeight: typography.lineHeight.md,
    },
    heading1: {
      color: isUser ? colors.black : colors.white,
      fontSize: typography.fontSize.xl,
      fontWeight: 'bold',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    heading2: {
      color: isUser ? colors.black : colors.white,
      fontSize: typography.fontSize.lg,
      fontWeight: 'bold',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    heading3: {
      color: isUser ? colors.black : colors.white,
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
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      fontFamily: typography.fontFamily.mono,
      fontSize: typography.fontSize.sm,
    },
    code_inline: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      padding: spacing.xs,
      borderRadius: borderRadius.sm,
      fontFamily: typography.fontFamily.mono,
      fontSize: typography.fontSize.sm,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.emerald,
      paddingLeft: spacing.md,
      marginLeft: spacing.sm,
      opacity: 0.8,
    },
    link: {
      color: colors.emerald,
      textDecorationLine: 'underline',
    },
    hr: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      height: 1,
      marginVertical: spacing.md,
    },
    table: {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: borderRadius.sm,
      marginVertical: spacing.md,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    th: {
      padding: spacing.sm,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    td: {
      padding: spacing.sm,
    },
  };
  
  // Function to parse message content and render auth buttons
  const renderMessageContent = (content) => {
    // If we need to show auth redirect, render that instead
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
      // No auth requests, render as markdown
      return (
        <Markdown style={markdownStyles}>
          {content}
        </Markdown>
      );
    }
    
    // Split the content into parts
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = AUTH_REQUEST_PATTERN.exec(content)) !== null) {
      // Add text before the auth request
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      // Add the auth request
      parts.push({
        type: 'auth',
        service: match[1]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }
    
    // Render the parts
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
    backgroundColor: colors.emerald,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderBottomRightRadius: 4, // Creates chat bubble "tail" effect
    elevation: 3,
    shadowColor: colors.emerald,
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
    color: colors.white,
  },
  botText: {
    color: colors.white,
  },
});

export default ChatMessage;
