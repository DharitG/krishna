import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../constants/Theme';

const suggestions = [
  { icon: 'list', text: 'List 5 healthy breakfast ideas' },
  { icon: 'calendar', text: 'What should I do in Tokyo?' },
  { icon: 'language', text: 'Translate to Spanish' }
];

const SuggestionBoxes = ({ onSelectSuggestion }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.suggestionScroll}
  >
    {suggestions.map((item, index) => (
      <TouchableOpacity 
        key={index} 
        style={styles.suggestionBox}
        onPress={() => onSelectSuggestion?.(item.text)}
      >
        <Ionicons 
          name={item.icon} 
          size={14} 
          color={colors.text.primary} 
          style={styles.suggestionIcon} 
        />
        <Text style={styles.suggestionText}>{item.text}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  suggestionScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: 20,
  },
  suggestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.buttonBackground,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 10,
  },
  suggestionIcon: {
    marginRight: 6,
  },
  suggestionText: {
    color: colors.text.primary,
    fontSize: 13,
  },
});

export default SuggestionBoxes;
