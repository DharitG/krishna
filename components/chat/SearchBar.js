import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MagnifyingGlass, X } from 'phosphor-react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/Theme';
import GlassCard from '../GlassCard';

const SearchBar = ({ onSearch, onClear }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSearch = (text) => {
    setSearchQuery(text);
    onSearch(text);
  };
  
  const handleClear = () => {
    setSearchQuery('');
    onClear();
  };
  
  return (
    <GlassCard style={styles.container}>
      <MagnifyingGlass 
        size={20} 
        color={isFocused ? colors.emerald : colors.lightGray} 
        weight="regular" 
      />
      
      <TextInput
        style={styles.input}
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search in conversations..."
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={16} color={colors.lightGray} weight="regular" />
        </TouchableOpacity>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: 'rgba(30, 30, 34, 0.8)',
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.white,
    fontSize: typography.fontSize.md,
  },
  clearButton: {
    padding: spacing.xs,
  },
});

export default SearchBar;