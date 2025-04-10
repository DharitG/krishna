import React, { useState } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import BottomPopup from './BottomPopup';
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
    danger: '#EF4444'
  }
};

/**
 * Example component demonstrating how to use the BottomPopup component
 * with both authentication and confirmation scenarios
 */
const BottomPopupExample = () => {
  // State for controlling popup visibility
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  
  // State for tracking authentication status
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  
  // Mock authentication function
  const handleAuthenticate = () => {
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      // 80% success rate for demo purposes
      const success = Math.random() > 0.2;
      
      if (success) {
        setIsConnected(true);
        setIsLoading(false);
        
        // Close popup after successful authentication
        setTimeout(() => {
          setShowAuthPopup(false);
        }, 1500);
      } else {
        setError('Authentication failed. Please try again.');
        setIsLoading(false);
      }
    }, 2000);
  };
  
  // Mock confirmation handlers
  const handleConfirm = () => {
    console.log('Action confirmed');
    
    // Close popup after confirmation
    setTimeout(() => {
      setShowConfirmationPopup(false);
    }, 1500);
  };
  
  const handleCancel = () => {
    console.log('Action cancelled');
    setShowConfirmationPopup(false);
  };
  
  // Auth props for the DynamicAuthBlob component
  const authProps = {
    service: 'github',
    onAuthenticate: handleAuthenticate,
    isLoading: isLoading,
    isConnected: isConnected,
    error: error,
    onErrorDismiss: () => setError('')
  };
  
  // Confirmation props for the DynamicConfirmationBlob component
  const confirmationProps = {
    action: 'delete',
    service: 'github',
    details: [
      { label: 'Repository', value: 'user/repo-name' },
      { label: 'Type', value: 'Pull Request' },
      { label: 'ID', value: '#123' }
    ],
    onConfirm: handleConfirm,
    onCancel: handleCancel
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bottom Popup Examples</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Show Auth Popup" 
          onPress={() => setShowAuthPopup(true)}
          color={extendedTheme.colors.primary}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Show Confirmation Popup" 
          onPress={() => setShowConfirmationPopup(true)}
          color={extendedTheme.colors.danger}
        />
      </View>
      
      {/* Authentication Popup */}
      <BottomPopup
        visible={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        type="auth"
        authProps={authProps}
      />
      
      {/* Confirmation Popup */}
      <BottomPopup
        visible={showConfirmationPopup}
        onClose={() => setShowConfirmationPopup(false)}
        type="confirmation"
        confirmationProps={confirmationProps}
      />
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
    marginBottom: extendedTheme.spacing.xl
  },
  buttonContainer: {
    marginVertical: extendedTheme.spacing.md,
    width: '80%'
  }
});

export default BottomPopupExample;
