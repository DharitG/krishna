import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Linking, Alert, Animated } from 'react-native';
import Markdown from 'react-native-markdown-display';
import Constants from 'expo-constants';
import AuthButton from './AuthButton';
import useZustandChatStore from '../../services/chatStore';
import { useAuthConfirmation } from '../AuthConfirmationManager';
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  glassMorphism
} from '../../constants/Theme';

// Regex pattern to detect auth requests in the message
const AUTH_REQUEST_PATTERN = /\[AUTH_REQUEST:(\w+)\]/g;

const ChatMessage = ({ message, onAuthSuccess, index, isStreaming }) => {
  const isUser = message.role === 'user';
  const [authStates, setAuthStates] = useState({});
  
  // Get store methods
  const authenticateService = useZustandChatStore(state => state.authenticateService);
  const checkToolAuth = useZustandChatStore(state => state.checkToolAuth);
  
  // Get auth confirmation methods
  const { requestAuthentication } = useAuthConfirmation();
  
  // Check if the message contains an auth request and handle it
  useEffect(() => {
    if (message.content && message.content.includes('[AUTH_REQUEST:')) {
      // Extract service name from the message
      const match = AUTH_REQUEST_PATTERN.exec(message.content);
      if (match && match[1]) {
        const service = match[1];
        handleAuthRequest(service);
      }
    }
  }, [message]);

  // Function to handle authentication request from message
  const handleAuthRequest = async (service) => {
    console.log(`Handling authentication request for service: ${service}`);
    
    try {
      // First check if the service is already authenticated
      const authStatus = await checkToolAuth(service);
      
      if (authStatus.isAuthenticated) {
        console.log(`${service} is already authenticated`);
        // Update local state to reflect authenticated status
        setAuthStates(prev => ({
          ...prev,
          [service]: { isAuthenticated: true, isLoading: false }
        }));
        
        // Notify parent component that authentication is complete
        if (onAuthSuccess) {
          onAuthSuccess(service);
        }
        
        return;
      }
      
      // Service needs authentication, use the bottom popup
      await requestAuthentication({
        service: service,
        onAuthenticate: async () => {
          // This will be called when the user clicks the Connect button in the popup
          console.log(`Starting authentication for service: ${service}`);
          
          try {
            // Get the authentication URL from the backend
            const result = await authenticateService(service);
            
            if (result.error) {
              throw new Error(result.message || result.error || 'Failed to connect to service');
            }
            
            if (!result.redirectUrl) {
              throw new Error('No redirect URL provided');
            }
            
            // Open the authentication URL in a browser
            await Linking.openURL(result.redirectUrl);
            
            // Start polling for authentication status
            return new Promise((resolve, reject) => {
              const pollInterval = setInterval(async () => {
                try {
                  const status = await checkToolAuth(service);
                  console.log(`Auth status for ${service}:`, status);
                  
                  if (status.isAuthenticated) {
                    clearInterval(pollInterval);
                    
                    // Update local state
                    setAuthStates(prev => ({
                      ...prev,
                      [service]: { isAuthenticated: true, isLoading: false }
                    }));
                    
                    // Notify parent component
                    if (onAuthSuccess) {
                      onAuthSuccess(service);
                    }
                    
                    resolve();
                  }
                } catch (error) {
                  console.error(`Error polling auth status for ${service}:`, error);
                  clearInterval(pollInterval);
                  reject(error);
                }
              }, 2000); // Poll every 2 seconds
              
              // Set a timeout to stop polling after 2 minutes
              setTimeout(() => {
                clearInterval(pollInterval);
                reject(new Error('Authentication timed out'));
              }, 120000); // 2 minutes
            });
          } catch (error) {
            console.error(`Authentication error for ${service}:`, error);
            Alert.alert('Authentication Error', error.message || 'An unexpected error occurred');
            throw error;
          }
        }
      });
      
      console.log(`Authentication flow completed for ${service}`);
    } catch (error) {
      console.error(`Error handling auth request for ${service}:`, error);
      // User cancelled or authentication failed
      setAuthStates(prev => ({
        ...prev,
        [service]: { isLoading: false, error: error.message }
      }));
    }
  };

  // Markdown styles
  const markdownStyles = {
    body: {
      color: isUser ? colors.white : colors.text.primary,
      fontSize: typography.fontSize.md,
      lineHeight: typography.lineHeight.md,
    },
    heading1: {
      color: isUser ? colors.white : colors.text.primary,
      fontSize: typography.fontSize.xl,
      fontWeight: 'bold',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    heading2: {
      color: isUser ? colors.white : colors.text.primary,
      fontSize: typography.fontSize.lg,
      fontWeight: 'bold',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    heading3: {
      color: isUser ? colors.white : colors.text.primary,
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

  // Function to parse message content and render it with auth requests replaced
  const renderMessageContent = (content) => {
    if (!content) return null;
    
    // If the message doesn't contain auth requests, render it as is
    if (!content.includes('[AUTH_REQUEST:')) {
      return (
        <Markdown style={markdownStyles}>
          {content}
        </Markdown>
      );
    }
    
    // Replace auth request tags with a simple message
    // The actual auth request is handled by the useEffect hook above
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // Reset the regex index
    AUTH_REQUEST_PATTERN.lastIndex = 0;
    
    while ((match = AUTH_REQUEST_PATTERN.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      const service = match[1];
      const authState = authStates[service] || {};
      
      // Add a message about the authentication status
      let authMessage;
      if (authState.isAuthenticated) {
        authMessage = `✅ Connected to ${service}. You can now use this service.`;
      } else if (authState.isLoading) {
        authMessage = `⏳ Connecting to ${service}...`;
      } else if (authState.error) {
        authMessage = `❌ Error connecting to ${service}: ${authState.error}`;
      } else {
        authMessage = `🔄 Authentication with ${service} is in progress.`;
      }
      
      parts.push({
        type: 'text',
        content: `*${authMessage}*`
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
        {parts.map((part, i) => (
          <Markdown key={i} style={markdownStyles}>
            {part.content}
          </Markdown>
        ))}
      </View>
    );
  };

  if (isUser) {
    return (
      <View style={[styles.container, styles.userContainer]}>
        <View style={[styles.bubble, styles.userBubble]}>
          {renderMessageContent(message.content)}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.botContainer]}>
      {renderMessageContent(message.content)}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.md,
  },
  userBubble: {
    ...glassMorphism.chatBubble,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    backgroundColor: 'rgba(48, 109, 255, 0.15)',
  },
});

export default ChatMessage;
