import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Markdown from 'react-native-markdown-display';
import GlassCard from '../GlassCard';
import AuthButton from './AuthButton';
import chatStore from '../../services/chatStore';
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  animation
} from '../../constants/Theme';

// Regex pattern to detect auth requests in the message
// Format: [AUTH_REQUEST:service]
const AUTH_REQUEST_PATTERN = /\[AUTH_REQUEST:(\w+)\]/g;

const ChatMessage = ({ message, onAuthSuccess, index }) => {
  const isUser = message.role === 'user';
  const [authStates, setAuthStates] = useState({});
  const fadeAnim = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(20))[0];
  
  // Animate message appearance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animation.normal,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: animation.normal,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
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
    if (!content.includes('[AUTH_REQUEST:')) {
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
  
  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY }],
  };
  
  if (isUser) {
    return (
      <Animated.View style={[styles.container, styles.userContainer, animatedStyle]}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Markdown style={markdownStyles}>
            {message.content}
          </Markdown>
        </View>
      </Animated.View>
    );
  }
  
  return (
    <Animated.View style={[styles.container, styles.botContainer, animatedStyle]}>
      <GlassCard style={[styles.bubble, styles.botBubble]}>
        {renderMessageContent(message.content)}
      </GlassCard>
    </Animated.View>
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