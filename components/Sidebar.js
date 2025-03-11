import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Modal
} from 'react-native';
import { 
  ChatCircle, 
  PlusCircle, 
  Gear, 
  SignOut, 
  X,
  User
} from 'phosphor-react-native';
import GlassCard from './GlassCard';
import { colors, spacing, borderRadius, typography } from '../constants/Theme';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.85;

const Sidebar = ({ visible, onClose, onNewChat, onSelectChat, chats = [], activeChat }) => {
  const renderChatItem = (chat, index) => {
    const isActive = activeChat === chat.id;
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
        <Text style={[styles.chatTitle, isActive && styles.activeChatTitle]} numberOfLines={1}>
          {chat.title || `Chat ${index + 1}`}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>August</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.white} weight="regular" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.newChatButton} onPress={onNewChat}>
            <PlusCircle size={20} color={colors.white} weight="regular" />
            <Text style={styles.newChatText}>New Chat</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <ScrollView style={styles.chatsContainer}>
            <Text style={styles.sectionTitle}>Recent Chats</Text>
            {chats.length > 0 ? (
              chats.map(renderChatItem)
            ) : (
              <Text style={styles.emptyText}>No recent chats</Text>
            )}
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerButton}>
              <User size={22} color={colors.white} weight="regular" />
              <Text style={styles.footerButtonText}>Account</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.footerButton}>
              <Gear size={22} color={colors.white} weight="regular" />
              <Text style={styles.footerButtonText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.footerButton}>
              <SignOut size={22} color={colors.white} weight="regular" />
              <Text style={styles.footerButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.darkGray,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
  },
  newChatText: {
    marginLeft: spacing.sm,
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
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
  chatTitle: {
    marginLeft: spacing.sm,
    color: colors.white,
    fontSize: typography.fontSize.md,
  },
  activeChatTitle: {
    fontWeight: '600',
    color: colors.emerald,
  },
  emptyText: {
    color: colors.lightGray,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: typography.fontSize.md,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
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
});

export default Sidebar;