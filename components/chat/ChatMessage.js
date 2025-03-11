import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '../GlassCard';
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography
} from '../../constants/Theme';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  
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
        <Text style={[styles.text, styles.botText]}>
          {message.content}
        </Text>
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
    maxWidth: '80%',
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