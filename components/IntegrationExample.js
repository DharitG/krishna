import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Text, Alert } from 'react-native';
import { useAuthConfirmation } from './AuthConfirmationManager';
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
    primary: '#7C3AED',
    success: '#10B981',
    danger: '#EF4444',
  }
};
import { useAuth } from '../services/authContext';
import composioService from '../services/composio';

/**
 * Example component demonstrating how to integrate the AuthConfirmationManager
 * in a real-world scenario with proper authentication handling
 */
const IntegrationExample = () => {
  const { requestAuthentication, requestConfirmation } = useAuthConfirmation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Example function to handle GitHub repository access
  const handleAccessGitHubRepo = async () => {
    try {
      // Check if user is authenticated first (as per security requirements)
      if (!user) {
        Alert.alert('Authentication Required', 'You must be logged in to access GitHub repositories.');
        return;
      }
      
      setIsLoading(true);
      
      // Check if the user has authenticated with GitHub
      const authStatus = await composioService.checkServiceAuth('github');
      
      if (!authStatus.isAuthenticated) {
        // Request GitHub authentication using the bottom popup
        try {
          await requestAuthentication({
            service: 'github',
            isLoading: false,
            isConnected: false,
            error: '',
            onAuthenticate: async () => {
              // This would typically redirect to OAuth flow
              // For demo purposes, we'll simulate the authentication process
              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve();
                }, 2000);
              });
            }
          });
          
          // Authentication successful, continue with the operation
          Alert.alert('Success', 'GitHub authentication successful!');
        } catch (error) {
          // User cancelled authentication
          console.log('Authentication cancelled:', error);
          setIsLoading(false);
          return;
        }
      }
      
      // Now that we're authenticated, request confirmation for the action
      try {
        await requestConfirmation({
          action: 'access',
          service: 'github',
          details: [
            { label: 'Repository', value: 'user/example-repo' },
            { label: 'Access Type', value: 'Read & Write' },
            { label: 'Duration', value: '30 days' }
          ],
          onConfirm: async () => {
            // Simulate API call
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve();
              }, 1500);
            });
          }
        });
        
        // Confirmation successful, perform the actual operation
        Alert.alert('Success', 'Access granted to GitHub repository!');
      } catch (error) {
        // User cancelled confirmation
        console.log('Confirmation cancelled:', error);
      }
    } catch (error) {
      console.error('Error accessing GitHub repository:', error);
      Alert.alert('Error', 'Failed to access GitHub repository. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Example function to handle email sending
  const handleSendEmail = async () => {
    try {
      // Check if user is authenticated first (as per security requirements)
      if (!user) {
        Alert.alert('Authentication Required', 'You must be logged in to send emails.');
        return;
      }
      
      setIsLoading(true);
      
      // Check if the user has authenticated with Gmail
      const authStatus = await composioService.checkServiceAuth('gmail');
      
      if (!authStatus.isAuthenticated) {
        // Request Gmail authentication using the bottom popup
        try {
          await requestAuthentication({
            service: 'gmail',
            isLoading: false,
            isConnected: false,
            error: '',
            onAuthenticate: async () => {
              // This would typically redirect to OAuth flow
              // For demo purposes, we'll simulate the authentication process
              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve();
                }, 2000);
              });
            }
          });
          
          // Authentication successful, continue with the operation
          Alert.alert('Success', 'Gmail authentication successful!');
        } catch (error) {
          // User cancelled authentication
          console.log('Authentication cancelled:', error);
          setIsLoading(false);
          return;
        }
      }
      
      // Now that we're authenticated, request confirmation for the action
      try {
        await requestConfirmation({
          action: 'email',
          service: 'gmail',
          details: [
            { label: 'To', value: 'recipient@example.com' },
            { label: 'Subject', value: 'Important Information' },
            { label: 'Content', value: 'This is a test email sent from August AI.' }
          ],
          onConfirm: async () => {
            // Simulate API call
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve();
              }, 1500);
            });
          }
        });
        
        // Confirmation successful, perform the actual operation
        Alert.alert('Success', 'Email sent successfully!');
      } catch (error) {
        // User cancelled confirmation
        console.log('Confirmation cancelled:', error);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      Alert.alert('Error', 'Failed to send email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Example function to handle content deletion
  const handleDeleteContent = async () => {
    try {
      // Check if user is authenticated first (as per security requirements)
      if (!user) {
        Alert.alert('Authentication Required', 'You must be logged in to delete content.');
        return;
      }
      
      setIsLoading(true);
      
      // For deletion, we only need confirmation (no service auth required)
      try {
        await requestConfirmation({
          action: 'delete',
          service: null,
          details: [
            { label: 'Type', value: 'Chat History' },
            { label: 'Items', value: '5 conversations' },
            { label: 'Warning', value: 'This action cannot be undone' }
          ],
          onConfirm: async () => {
            // Simulate API call
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve();
              }, 1500);
            });
          }
        });
        
        // Confirmation successful, perform the actual operation
        Alert.alert('Success', 'Content deleted successfully!');
      } catch (error) {
        // User cancelled confirmation
        console.log('Confirmation cancelled:', error);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      Alert.alert('Error', 'Failed to delete content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Integration Example</Text>
      <Text style={styles.subtitle}>
        Demonstrating authentication and confirmation flows with bottom popups
      </Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Access GitHub Repository" 
          onPress={handleAccessGitHubRepo}
          color={extendedTheme.colors.primary}
          disabled={isLoading}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Send Email" 
          onPress={handleSendEmail}
          color={extendedTheme.colors.success}
          disabled={isLoading}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Delete Content" 
          onPress={handleDeleteContent}
          color={extendedTheme.colors.danger}
          disabled={isLoading}
        />
      </View>
      
      <Text style={styles.note}>
        Note: These examples simulate the authentication and confirmation flows.
        In a real application, they would connect to actual services.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: extendedTheme.spacing.lg,
    backgroundColor: extendedTheme.colors.background.primary
  },
  title: {
    fontSize: extendedTheme.fontSizes.xl,
    fontWeight: 'bold',
    color: extendedTheme.colors.text.primary,
    marginBottom: extendedTheme.spacing.sm
  },
  subtitle: {
    fontSize: extendedTheme.fontSizes.md,
    color: extendedTheme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.xl,
    paddingHorizontal: extendedTheme.spacing.lg
  },
  buttonContainer: {
    marginVertical: extendedTheme.spacing.md,
    width: '80%'
  },
  note: {
    fontSize: extendedTheme.fontSizes.sm,
    color: extendedTheme.colors.text.secondary,
    textAlign: 'center',
    marginTop: extendedTheme.spacing.xl,
    paddingHorizontal: extendedTheme.spacing.lg
  }
});

export default IntegrationExample;
