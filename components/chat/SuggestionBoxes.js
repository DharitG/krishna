import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, glassMorphism, borderRadius, typography, shadows } from '../../constants/Theme';

const suggestions = [
  { 
    icon: 'time-outline', 
    title: 'Daily Briefing',
    subtitle: 'Get up to speed'
  },
  { 
    icon: 'mail-outline', 
    title: 'Email Assistant',
    subtitle: 'Manage inbox'
  },
  { 
    icon: 'card-outline', 
    title: 'Track Refund',
    subtitle: 'Check status'
  },
  { 
    icon: 'help-circle-outline', 
    title: 'Personal Help',
    subtitle: 'Ask anything'
  },
  { 
    icon: 'calendar-outline', 
    title: 'Smart Schedule',
    subtitle: 'Plan your day'
  }
];

const SuggestionBoxes = ({ onSelectSuggestion, style }) => (
  <Animated.View style={[styles.container, style]}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.suggestionScroll}
    >
      {suggestions.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.suggestionBox}
          onPress={() => onSelectSuggestion?.(`${item.title} ${item.subtitle}`)}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name={item.icon} 
              size={20} 
              color={colors.text.primary} 
              style={styles.suggestionIcon} 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.subtitleText}>{item.subtitle}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  suggestionScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    gap: 4,
  },
  suggestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    ...glassMorphism.chatInput,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 4,
    shadowColor: '#306DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 145,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(48, 109, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  suggestionIcon: {
    opacity: 0.9,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    color: colors.text.primary,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  subtitleText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontFamily: typography.fontFamily.regular,
    letterSpacing: 0.2,
  },
});

export default SuggestionBoxes;
