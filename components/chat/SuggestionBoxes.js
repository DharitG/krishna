import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, glassMorphism, borderRadius, typography } from '../../constants/Theme';

const suggestions = [
  { icon: 'list', text: 'List 5 healthy breakfast ideas' },
  { icon: 'calendar', text: 'What should I do in Tokyo?' },
  { icon: 'language', text: 'Translate to Spanish' },
  { icon: 'bulb', text: 'Give me creative ideas' },
  { icon: 'code', text: 'Help me code something' }
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
    backgroundColor: 'rgba(26, 44, 75, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(48, 109, 255, 0.15)',
    ...shadows.sm,
  },
  suggestionIcon: {
    marginRight: spacing.xs,
    opacity: 0.9,
  },
  suggestionText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    letterSpacing: 0.2,
  },
});

export default SuggestionBoxes;
