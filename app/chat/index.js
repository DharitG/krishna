import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import ChatMessage from '../../components/chat/ChatMessage';
import MessageInput from '../../components/chat/MessageInput';
import { sendMessageMock } from '../../services/api';

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm August, your AI super agent. How can I help you today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async (content) => {
    // Add user message to the chat
    const userMessage = { role: 'user', content };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Get all messages for context
      const allMessages = [...messages, userMessage];
      
      // Send to API (using mock for demo)
      const response = await sendMessageMock(allMessages);
      
      // Add assistant response
      setMessages(prevMessages => [...prevMessages, response]);
    } catch (error) {
      // Handle error
      console.error('Error in chat:', error);
      setMessages(prevMessages => [
        ...prevMessages, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => <ChatMessage message={item} />}
          keyExtractor={(_, index) => index.toString()}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
        />
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 10,
  },
});

export default ChatScreen;