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
} from 'react-native';
import { SidebarSimple, Plus, Cloud } from 'phosphor-react-native';
import Constants from 'expo-constants';
import ChatMessage from '../../components/chat/ChatMessage';
import MessageInput from '../../components/chat/MessageInput';
import GradientBackground from '../../components/GradientBackground';
import Sidebar from '../../components/Sidebar';
import chatStore from '../../services/chatStore';
import { colors, spacing, typography } from '../../constants/Theme';

// Check if Azure is configured
const isAzureConfigured = !!Constants.expoConfig?.extra?.AZURE_OPENAI_API_KEY;

const ChatScreen = () => {
  // Use the chat store to manage chats
  const [activeChat, setActiveChat] = useState(chatStore.getActiveChat());
  const [chats, setChats] = useState(chatStore.getChats());
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  const flatListRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && activeChat.messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [activeChat.messages.length]);

  const handleSendMessage = async (content) => {
    // Set loading state
    setIsLoading(true);
    
    try {
      // Send the message using the chat store
      await chatStore.sendMessage(content);
      
      // Update state with the latest chat
      setActiveChat({...chatStore.getActiveChat()});
      setChats([...chatStore.getChats()]);
    } catch (error) {
      console.error('Error in chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    chatStore.createChat();
    setActiveChat({...chatStore.getActiveChat()});
    setChats([...chatStore.getChats()]);
    setSidebarVisible(false);
  };

  const handleSelectChat = (chatId) => {
    chatStore.setActiveChat(chatId);
    setActiveChat({...chatStore.getActiveChat()});
    setSidebarVisible(false);
  };

  return (
    <GradientBackground colors={[colors.black, colors.darkGray]}>
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
            {isAzureConfigured && (
              <View style={styles.azureBadge}>
                <Cloud size={12} color={colors.white} weight="fill" />
                <Text style={styles.azureBadgeText}>Azure</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleNewChat}
          >
            <Plus size={24} color={colors.white} weight="regular" />
          </TouchableOpacity>
        </View>
        
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <FlatList
            ref={flatListRef}
            data={activeChat.messages}
            renderItem={({ item }) => <ChatMessage message={item} />}
            keyExtractor={(_, index) => index.toString()}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
          />
          <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </KeyboardAvoidingView>
        
        <Sidebar 
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          chats={chats}
          activeChat={activeChat.id}
        />
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  azureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  azureBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
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
  container: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: spacing.sm,
  },
});

export default ChatScreen;