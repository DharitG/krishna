import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IntegrationExample from '../components/IntegrationExample';
import BottomPopupExample from '../components/BottomPopupExample';
import { theme } from '../constants/NewTheme';

// Define additional theme values for this component
const extendedTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: {
      primary: '#1A1A1A',
      secondary: '#2A2A2A',
      tertiary: '#333333'
    },
    border: {
      ...theme.colors.border,
      primary: 'rgba(255, 255, 255, 0.1)'
    },
    shadow: {
      default: 'rgba(0, 0, 0, 0.3)'
    }
  },
  shadows: {
    ...theme.shadows,
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5
    }
  }
};

/**
 * Demo screen for the Bottom Popup components
 * Shows both the raw component example and the integrated authentication flow
 */
const BottomPopupDemo = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bottom Popup Demo</Text>
          <Text style={styles.subtitle}>
            Examples of the bottom popup component for authentication and confirmation
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Component Example</Text>
          <Text style={styles.sectionDescription}>
            Basic usage of the BottomPopup component with manual controls
          </Text>
          <BottomPopupExample />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integration Example</Text>
          <Text style={styles.sectionDescription}>
            Real-world usage with the AuthConfirmationManager
          </Text>
          <IntegrationExample />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All authentication requests are properly secured and require user authentication
            before any service connections can be established.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: extendedTheme.colors.background.primary
  },
  container: {
    flex: 1,
  },
  header: {
    padding: extendedTheme.spacing.lg,
    backgroundColor: extendedTheme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: extendedTheme.colors.border.primary,
  },
  title: {
    fontSize: 24, // Using a direct value since xxl isn't defined
    fontWeight: 'bold',
    color: extendedTheme.colors.text.primary,
    marginBottom: extendedTheme.spacing.xs,
  },
  subtitle: {
    fontSize: extendedTheme.fontSizes.md,
    color: extendedTheme.colors.text.secondary,
  },
  section: {
    padding: extendedTheme.spacing.lg,
    marginBottom: extendedTheme.spacing.lg,
    backgroundColor: extendedTheme.colors.background.tertiary,
    borderRadius: extendedTheme.borderRadius.md,
    marginHorizontal: extendedTheme.spacing.md,
    marginTop: extendedTheme.spacing.md,
    ...extendedTheme.shadows.sm,
  },
  sectionTitle: {
    fontSize: extendedTheme.fontSizes.lg,
    fontWeight: 'bold',
    color: extendedTheme.colors.text.primary,
    marginBottom: extendedTheme.spacing.xs,
  },
  sectionDescription: {
    fontSize: extendedTheme.fontSizes.sm,
    color: extendedTheme.colors.text.secondary,
    marginBottom: extendedTheme.spacing.md,
  },
  footer: {
    padding: extendedTheme.spacing.lg,
    backgroundColor: extendedTheme.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: extendedTheme.colors.border.primary,
    marginTop: extendedTheme.spacing.lg,
  },
  footerText: {
    fontSize: extendedTheme.fontSizes.sm,
    color: extendedTheme.colors.text.secondary,
    textAlign: 'center',
  },
});

// Make sure to export the component as the default export for Expo Router
export default function Page() {
  return <BottomPopupDemo />;
}
