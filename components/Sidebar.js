import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Modal,
  Animated,
  TextInput,
  Platform
} from 'react-native';
import { 
  ChatCircle, 
  PlusCircle, 
  Gear, 
  SignOut, 
  X,
  User,
  MagnifyingGlass
} from 'phosphor-react-native';
import GlassCard from './GlassCard';
import { colors, spacing, borderRadius, typography } from '../constants/Theme';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.85;

const Sidebar = ({ visible, onClose, onNewChat, onSelectChat, chats = [], activeChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState(chats);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);
  
  // Update filtered chats when search query changes or chats update
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = chats.filter(chat => 
      chat.title.toLowerCase().includes(query) || 
      chat.messages.some(msg => msg.content.toLowerCase().includes(query))
    );
    
    setFilteredChats(filtered);
  }, [searchQuery, chats]);
  
  const handleSearch = (text) => {
    setSearchQuery(text);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const renderChatItem = (chat, index) => {
    const isActive = activeChat === chat.id;
    
    // If we're searching and there are matching messages, highlight them
    let highlightCount = 0;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      highlightCount = chat.messages.filter(msg => 
        msg.content.toLowerCase().includes(query)
      ).length;
    }
    
    return (
      <TouchableOpacity 
        key={chat.id} 
        style={[styles.chatItem, isActive && styles.activeChatItem]}
        onPress={() => onSelectChat(chat.id)}
      >
        <ChatCircle 
          size={22} 
          color={isActive ? colors.emerald : colors.white} 
          weight={isActive ? "fill" : "regular"}
        />
        <View style={styles.chatItemContent}>
          <Text style={[styles.chatTitle, isActive && styles.activeChatTitle]} numberOfLines={1}>
            {chat.title || `Chat ${index + 1}`}
          </Text>
          
          {highlightCount > 0 && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>{highlightCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.container, 
            { transform: [{ translateX: slideAnim }] }
          ]}>
          <View style={styles.header}>
            <Text style={styles.title}>August</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.white} weight="regular" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <MagnifyingGlass 
                size={18} 
                color={colors.lightGray} 
                weight="regular" 
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search chats..."
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                  <X size={14} color={colors.lightGray} weight="regular" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={onNewChat} style={styles.newChatIcon}>
              <PlusCircle size={20} color={colors.white} weight="regular" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <ScrollView style={styles.chatsContainer}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : 'Recent Chats'}
            </Text>
            {filteredChats.length > 0 ? (
              filteredChats.map(renderChatItem)
            ) : (
              <Text style={styles.emptyText}>
                {searchQuery ? 'No results found' : 'No recent chats'}
              </Text>
            )}
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerButton}>
              <User size={22} color={colors.white} weight="regular" />
              <Text style={styles.footerButtonText}>Account</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.footerButton}
              onPress={() => {
                onClose();
                import('expo-router').then(({ router }) => router.push('/settings'));
              }}
            >
              <Gear size={22} color={colors.white} weight="regular" />
              <Text style={styles.footerButtonText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => {
                onClose();
                import('expo-router').then(({ router }) => router.push('/subscription'));
              }}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.darkGray,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 50 : 40, // Extra padding for notches
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Extra padding for bottom
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.brand,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    justifyContent: 'space-between',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: typography.fontSize.md,
    height: 24,
  },
  clearButton: {
    padding: 4,
  },
  newChatIcon: {
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.lightGray,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chatsContainer: {
    flex: 1,
    marginBottom: spacing.md,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: 2,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  activeChatItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  chatItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  chatTitle: {
    flex: 1,
    color: colors.white,
    fontSize: typography.fontSize.md,
  },
  activeChatTitle: {
    fontWeight: '600',
    color: colors.emerald,
  },
  matchBadge: {
    backgroundColor: colors.emerald,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
    paddingHorizontal: 6,
  },
  matchBadgeText: {
    color: colors.black,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  emptyText: {
    color: colors.lightGray,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: typography.fontSize.md,
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 'auto', // Push to bottom of container
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  footerButtonText: {
    marginLeft: spacing.sm,
    color: colors.white,
    fontSize: typography.fontSize.md,
  },
  upgradeButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.emerald,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: colors.black,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
});

export default Sidebar;