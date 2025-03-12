import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ChatCircle } from 'phosphor-react-native';
import GlassCard from '../GlassCard';
import { colors, spacing, typography, borderRadius } from '../../constants/Theme';

const SearchResults = ({ results, onSelectResult, onClose }) => {
  if (results.length === 0) {
    return (
      <GlassCard style={styles.noResultsContainer}>
        <Text style={styles.noResultsText}>No results found</Text>
      </GlassCard>
    );
  }
  
  const renderItem = ({ item }) => {
    const truncatedContent = item.message.content.length > 100 
      ? item.message.content.substring(0, 100) + '...' 
      : item.message.content;
    
    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => onSelectResult(item.chatId, item.messageIndex)}
      >
        <View style={styles.resultHeader}>
          <View style={styles.chatInfoContainer}>
            <ChatCircle size={16} color={colors.emerald} weight="regular" />
            <Text style={styles.chatTitle}>{item.chatTitle}</Text>
          </View>
          <Text style={styles.messageRole}>{item.message.role}</Text>
        </View>
        <Text style={styles.messageContent}>{truncatedContent}</Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <GlassCard style={styles.resultsCard}>
        <View style={styles.header}>
          <Text style={styles.resultsTitle}>
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item, index) => `search-result-${item.chatId}-${index}`}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    maxHeight: '60%',
    zIndex: 1000,
    paddingHorizontal: spacing.md,
  },
  resultsCard: {
    backgroundColor: 'rgba(30, 30, 34, 0.9)',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultsTitle: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  closeButtonText: {
    color: colors.emerald,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  resultItem: {
    padding: spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chatInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTitle: {
    color: colors.emerald,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  messageRole: {
    color: colors.lightGray,
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  },
  messageContent: {
    color: colors.white,
    fontSize: typography.fontSize.md,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: spacing.md,
  },
  noResultsContainer: {
    padding: spacing.md,
    marginHorizontal: spacing.md,
    backgroundColor: 'rgba(30, 30, 34, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    color: colors.lightGray,
    fontSize: typography.fontSize.md,
  },
});

export default SearchResults;