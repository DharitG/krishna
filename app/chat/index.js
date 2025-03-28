import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SidebarSimple, Plus } from 'phosphor-react-native';
import Constants from 'expo-constants';
import ChatMessage from '../../components/chat/ChatMessage';
import MessageInput from '../../components/chat/MessageInput';
import TypingIndicator from '../../components/chat/TypingIndicator';
import ChatBackgroundWrapper from '../../components/chat/ChatBackgroundWrapper';
import Sidebar from '../../components/Sidebar';
import chatStore from '../../services/chatStore';
import { colors, spacing, typography } from '../../constants/Theme';
import * as Linking from 'expo-linking';
import { useAuth } from '../../services/authContext';

const ChatScreen = () => {
  const { user } = useAuth();
  
  // Initialize state
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  
  const flatListRef = useRef(null);

  // Initialize chat store
  useEffect(() => {
    const loadChatData = async () => {
      try {
        await chatStore.initialize();
        const activeChatData = await chatStore.getActiveChat();
        const chatsData = await chatStore.getChats();
        
        // Ensure messages is always an array
        if (activeChatData && !Array.isArray(activeChatData.messages)) {
          activeChatData.messages = [];
        }
        
        setActiveChat(activeChatData);
        setChats(chatsData);
      } catch (error) {
        console.error('Error loading chat data:', error);
        // Fallback to empty state if there's an error
        setActiveChat({ id: 'fallback-chat', messages: [] });
        setChats([]);
      } finally {
        setIsInitializing(false);
      }
    };
    
    loadChatData();
  }, [user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && activeChat?.messages?.length > 0) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }, [activeChat?.messages]);

  // Add a new effect to handle scrolling during streaming
  useEffect(() => {
    if (streamingMessageId && flatListRef.current) {
      // Scroll to bottom whenever streaming content updates
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }, [streamingMessageId, activeChat?.messages]);

  const handleSendMessage = async (content) => {
    // Set loading state
    setIsLoading(true);
    
    try {
      // Add user message immediately for better UX
      const userMessage = { role: 'user', content, created_at: new Date() };
      
      // Check if activeChat.messages is an array
      if (activeChat && Array.isArray(activeChat.messages)) {
        // Update the UI immediately with user message only
        setActiveChat({
          ...activeChat,
          messages: [...activeChat.messages, userMessage]
        });
        
        // Force-scroll to the bottom
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: false });
        }
      }
      
      // Stream handler function that updates the UI with each chunk
      const handleStreamUpdate = (streamMessage) => {
        setStreamingMessageId(streamMessage.id);
        
        // Update the active chat with the streaming message content
        setActiveChat(prevChat => {
          // Create a copy of the current chat state
          const chatCopy = {...prevChat};
          
          // Ensure messages is an array
          if (!Array.isArray(chatCopy.messages)) {
            chatCopy.messages = [];
          }
          
          // Find the streaming message by ID
          const messageIndex = chatCopy.messages.findIndex(msg => 
            msg.id === streamMessage.id
          );
          
          if (messageIndex !== -1) {
            // Update existing message with new content
            chatCopy.messages[messageIndex] = {
              ...chatCopy.messages[messageIndex],
              content: streamMessage.content
            };
          } else {
            // Add new message if not found
            chatCopy.messages.push(streamMessage);
          }
          
          // Scroll to the bottom as new content comes in
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: false });
          }
          
          return chatCopy;
        });
        
        // Scroll to the bottom as new content comes in
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: false });
        }
      };
      
      // Send the message using the chat store with streaming
      const response = await chatStore.sendMessage(content, handleStreamUpdate);
      
      // Get the latest chats list for sidebar (for title updates)
      const updatedChats = await chatStore.getChats();
      setChats(updatedChats);
      
      // Final update to clear streaming state
      setStreamingMessageId(null);
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Provide a fallback message if there's an error
      if (activeChat && Array.isArray(activeChat.messages)) {
        // Add an error message to the local state only
        const errorMessage = {
          id: `local-error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again later.',
          created_at: new Date()
        };
        
        setActiveChat({
          ...activeChat,
          messages: [...activeChat.messages, errorMessage]
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      await chatStore.createChat();
      const newActiveChat = await chatStore.getActiveChat();
      const updatedChats = await chatStore.getChats();
      
      // Ensure messages is always an array
      if (newActiveChat && !Array.isArray(newActiveChat.messages)) {
        newActiveChat.messages = [];
      }
      
      setActiveChat(newActiveChat);
      setChats(updatedChats);
    } catch (error) {
      console.error('Error creating new chat:', error);
      // Create a local fallback chat if there's an error
      const fallbackChat = {
        id: `local-chat-${Date.now()}`,
        title: 'New Chat',
        messages: [{
          role: 'assistant',
          content: "Hello! I'm August. How can I help you today?"
        }],
        created_at: new Date(),
        updated_at: new Date()
      };
      
      setActiveChat(fallbackChat);
    } finally {
      setSidebarVisible(false);
    }
  };

  const handleSelectChat = async (chatId) => {
    try {
      await chatStore.setActiveChat(chatId);
      const selectedChat = await chatStore.getActiveChat();
      
      // Ensure messages is always an array
      if (selectedChat && !Array.isArray(selectedChat.messages)) {
        selectedChat.messages = [];
      }
      
      setActiveChat(selectedChat);
    } catch (error) {
      console.error('Error selecting chat:', error);
    } finally {
      setSidebarVisible(false);
    }
  };

  // Render item function for FlatList
  const renderItem = ({ item, index }) => (
    <ChatMessage
      message={item}
      onAuthSuccess={(service) => {
        // Update authentication status in the chat store
        chatStore.updateAuthStatus(service, true);
        
        // Update the active chat in the state
        setActiveChat({...chatStore.getActiveChat()});
        
        // Send a message to acknowledge authentication
        handleSendMessage(`I've successfully authenticated with ${service}`);
      }}
      index={index}
      isStreaming={item.id === streamingMessageId}
    />
  );

  // Handle content size changes in the FlatList
  const handleContentSizeChange = () => {
    if (flatListRef.current && activeChat?.messages?.length > 0) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  };

  // Show loading spinner while initializing
  if (isInitializing || !activeChat) {
    return (
      <ChatBackgroundWrapper>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.emerald} />
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
        </SafeAreaView>
      </ChatBackgroundWrapper>
    );
  }

  return (
    <ChatBackgroundWrapper>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => setSidebarVisible(true)}
          >
            <SidebarSimple size={24} color={colors.white} weight="regular" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>August</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleNewChat}
          >
            <Plus size={24} color={colors.white} weight="regular" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.chatContainer}>
          <View style={styles.messagesContainer}>
            <FlatList
              ref={flatListRef}
              data={Array.isArray(activeChat.messages) ? activeChat.messages : []}
              keyExtractor={(item, index) => item.id || `msg-${index}`}
              renderItem={renderItem}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={true}
              onContentSizeChange={handleContentSizeChange}
              onLayout={handleContentSizeChange}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={Keyboard.dismiss}
              removeClippedSubviews={false}
            />
          </View>
          
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
          >
            <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </KeyboardAvoidingView>
        </View>
        
        <Sidebar 
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          chats={chats}
          activeChat={activeChat.id}
        />
      </SafeAreaView>
    </ChatBackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.lightGray,
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingTop: Platform.OS === 'android' ? spacing.xl : spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.brand,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  messagesContainer: {
    flex: 1,
    position: 'relative',
  },
  messageListContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 80, // Add extra padding at the bottom to ensure messages are visible above the input
  },
});

export default ChatScreen;
