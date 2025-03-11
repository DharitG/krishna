import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <View style={[
      styles.container, 
      isUser ? styles.userContainer : styles.botContainer
    ]}>
      <View style={[
        styles.bubble, 
        isUser ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={[
          styles.text,
          isUser ? styles.userText : styles.botText
        ]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 5,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  botContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    padding: 15,
    borderRadius: 20,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 5,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: 'black',
  },
});

export default ChatMessage;