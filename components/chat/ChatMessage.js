import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import Markdown from 'react-native-markdown-display';
import GlassCard from '../GlassCard';
import AuthButton from './AuthButton';
import AuthRedirect from './AuthRedirect';
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
        setServiceToAuth(service);
        setShowAuthRedirect(true);
      }
    } catch (error) {
      setAuthStates(prev => ({
        ...prev,
        [service]: { isLoading: false, error: error.message }
      }));
    }
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
      color: isUser ? colors.white : colors.white,
      fontSize: typography.fontSize.md,
      lineHeight: typography.lineHeight.md,
    },
    heading1: {
      color: isUser ? colors.white : colors.white,
      fontSize: typography.fontSize.xl,
      fontWeight: 'bold',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    heading2: {
      color: isUser ? colors.white : colors.white,
      fontSize: typography.fontSize.lg,
      fontWeight: 'bold',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    heading3: {
      color: isUser ? colors.white : colors.white,
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
    
    // Reset the regex to start from the beginning
    AUTH_REQUEST_PATTERN.lastIndex = 0;
    
    // Find all auth requests in the content
    while ((match = AUTH_REQUEST_PATTERN.exec(content)) !== null) {
      const service = match[1];
      
      // Add text before the auth request
      if (match.index > lastIndex) {
        parts.push(
          <Markdown 
            key={`text-${lastIndex}`} 
            style={markdownStyles}
          >
            {content.slice(lastIndex, match.index)}
          </Markdown>
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
        <Markdown 
          key={`text-${lastIndex}`} 
          style={markdownStyles}
        >
          {content.slice(lastIndex)}
        </Markdown>
      );
    }
    
    return parts;
  };
  
  if (isUser) {
    return (
      <View style={[styles.container, styles.userContainer]}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Markdown style={markdownStyles}>
            {message.content}
          </Markdown>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, styles.botContainer]}>
      <GlassCard style={[styles.bubble, styles.botBubble]}>
        {renderMessageContent(message.content || '')}
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  botBubble: {
    borderBottomLeftRadius: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.5)',
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