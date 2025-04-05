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
  Animated,
} from 'react-native';
import LoadingIndicator from '../../components/LoadingIndicator';
import { SidebarSimple, Plus } from 'phosphor-react-native';
import Constants from 'expo-constants';
import ChatMessage from '../../components/chat/ChatMessage';
import MessageInput from '../../components/chat/MessageInput';
import SuggestionBoxes from '../../components/chat/SuggestionBoxes';
import WelcomeMessage from '../../components/chat/WelcomeMessage';
import TypingIndicator from '../../components/chat/TypingIndicator';
import ChatBackgroundWrapper from '../../components/chat/ChatBackgroundWrapper';
import Sidebar from '../../components/Sidebar';
import useZustandChatStore from '../../services/chatStore';
import { colors, spacing, typography } from '../../constants/Theme';
import * as Linking from 'expo-linking';
import { useAuth } from '../../services/authContext';

const ChatScreen = () => {
  const { user } = useAuth();
  
  // Get chat store state and actions
  const initialize = useZustandChatStore(state => state.initialize);
  const loadChats = useZustandChatStore(state => state.loadChats);
  const getActiveChat = useZustandChatStore(state => state.getActiveChat);
  const setActiveChat = useZustandChatStore(state => state.setActiveChat);
  const createNewChat = useZustandChatStore(state => state.createNewChat);
  const sendMessage = useZustandChatStore(state => state.sendMessage);
  const updateAuthStatus = useZustandChatStore(state => state.updateAuthStatus);
  
  // Initialize state
  const [activeChat, setActiveChatState] = useState(null);
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const suggestionBoxAnimation = useRef(new Animated.Value(1)).current;
  
  const flatListRef = useRef(null);

  // Initialize chat store
  useEffect(() => {
    const loadChatData = async () => {
      try {
        await initialize();
        const activeChatData = await getActiveChat();
        const chatsData = await loadChats();
        
        // Ensure messages is always an array
        if (activeChatData && !Array.isArray(activeChatData.messages)) {
          activeChatData.messages = [];
        }
        
        setActiveChatState(activeChatData);
        setChats(chatsData);
      } catch (error) {
        console.error('Error loading chat data:', error);
        // Fallback to empty state if there's an error
        setActiveChatState({ id: 'fallback-chat', messages: [] });
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
    if (!activeChat) return;
    
    // Set loading state
    setIsLoading(true);
    
    // If this is the first message, trigger fade out animation
    if (!hasUserSentMessage) {
      setHasUserSentMessage(true);
      Animated.timing(suggestionBoxAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    
    // Hide keyboard
    Keyboard.dismiss();
    
    try {
      // If this is a temporary chat, create a real chat in the database first
      let chatToUse = activeChat;
      if (activeChat.isTemporary) {
        try {
          const newActiveChat = await createNewChat('New Chat', true, false);
          const updatedChats = await loadChats();
          
          // Ensure messages is always an array
          if (newActiveChat && !Array.isArray(newActiveChat.messages)) {
            newActiveChat.messages = [];
          }
          
          chatToUse = newActiveChat;
          setActiveChatState(newActiveChat);
          setChats(updatedChats);
          
          // Remove the temporary chat from the local chats list
          setChats(prevChats => prevChats.filter(chat => chat.id !== activeChat.id));
        } catch (error) {
          console.error('Error creating permanent chat:', error);
          // Continue with the temporary chat if there's an error
        }
      }
      
      // Add user message immediately for better UX
      const userMessage = { role: 'user', content, created_at: new Date() };
      
      // Check if chatToUse.messages is an array
      if (chatToUse && Array.isArray(chatToUse.messages)) {
        // Update the UI immediately with user message only
        setActiveChatState({
          ...chatToUse,
          messages: [...chatToUse.messages, userMessage]
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
        setActiveChatState(prevChat => {
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
      };
      
      // Send the message using the chat store with streaming
      const response = await sendMessage(content, handleStreamUpdate);
      
      // Get the latest chats list for sidebar (for title updates)
      const updatedChats = await loadChats();
      setChats(updatedChats);
      
      // Get the updated active chat
      const updatedActiveChat = await getActiveChat();
      setActiveChatState(updatedActiveChat);
      
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
        
        setActiveChatState({
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
      // Create a temporary chat that's not saved to the database yet
      const temporaryChat = await createNewChat('New Chat', true, true);
      setActiveChatState(temporaryChat);
    } catch (error) {
      console.error('Error creating new chat:', error);
    } finally {
      setSidebarVisible(false);
    }
  };

  const handleSelectChat = async (chatId) => {
    try {
      const selectedChat = await setActiveChat(chatId);
      
      // Ensure messages is always an array
      if (selectedChat && !Array.isArray(selectedChat.messages)) {
        selectedChat.messages = [];
      }
      
      setActiveChatState(selectedChat);
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
        updateAuthStatus(service, true);
        
        // Update the active chat in the state
        getActiveChat().then(updatedChat => {
          setActiveChatState(updatedChat);
        });
        
        // Send a message to acknowledge authentication
        handleSendMessage(`I've successfully authenticated with ${service}.`);
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
            <LoadingIndicator size="large" color={colors.info} />
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
          {activeChat.messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <WelcomeMessage userName={user?.name} />
            </View>
          )}
          
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
            {!hasUserSentMessage && (
              <SuggestionBoxes 
                onSelectSuggestion={handleSendMessage} 
                style={{
                  opacity: suggestionBoxAnimation,
                  transform: [{
                    translateY: suggestionBoxAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  }]
                }}
              />
            )}
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
  },
  welcomeContainer: {
    position: 'absolute',
    top: -spacing.md,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  messagesContainer: {
    flex: 1,
    position: 'relative',
  },
  messageListContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 80,
  },
});

export default ChatScreen;
