import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import Button from '../Button';
import { checkToolAuth } from '../../services/api';
import composioService from '../../services/composio';
import * as WebBrowser from 'expo-web-browser';

/**
 * Component to handle authentication redirects for tools
 * @param {Object} props - Component props
 * @param {String} props.serviceName - Name of the service to authenticate with
 * @param {Function} props.onAuthComplete - Callback for when authentication is complete
 * @param {Function} props.onCancel - Callback for when authentication is cancelled
 */
const AuthRedirect = ({ serviceName, onAuthComplete, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authUrl, setAuthUrl] = useState(null);

  // Handle deep linking for auth callbacks
  useEffect(() => {
    // Set up a listener for when the app is opened via URL (auth callback)
    const handleUrl = async (event) => {
      const url = event.url;
      console.log('Deep link detected:', url);
      
      if (url.includes('auth/callback')) {
        try {
          // Handle the OAuth callback
          const result = await composioService.handleOAuthCallback(url);
          
          if (result.success) {
            console.log('Authentication successful:', result);
            onAuthComplete && onAuthComplete(serviceName);
          } else {
            console.error('Authentication failed:', result.error);
            setError(`Authentication failed: ${result.error}`);
          }
        } catch (error) {
          console.error('Error handling auth callback:', error);
          setError(`Error: ${error.message}`);
        }
      }
    };

    // Add event listener for URL opening
    const subscription = Linking.addEventListener('url', handleUrl);

    // Get initial URL (in case app was opened from URL)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl({ url });
      }
    });

    // Clean up
    return () => {
      subscription.remove();
    };
  }, [serviceName, onAuthComplete]);

  // Get auth URL on component mount
  useEffect(() => {
    const getAuthUrl = async () => {
      try {
        setLoading(true);
        
        // Check if tool requires authentication
        const authResult = await checkToolAuth(serviceName);
        
        if (authResult.needsAuth) {
          setAuthUrl(authResult.redirectUrl);
        } else {
          // Already authenticated
          onAuthComplete && onAuthComplete(serviceName);
        }
      } catch (error) {
        console.error('Error getting auth URL:', error);
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    getAuthUrl();
  }, [serviceName, onAuthComplete]);

  // Handle authentication button press
  const handleAuthPress = async () => {
    if (!authUrl) return;
    
    try {
      // Open auth URL in browser
      if (Platform.OS === 'web') {
        window.open(authUrl, '_blank');
      } else {
        await WebBrowser.openAuthSessionAsync(authUrl);
      }
    } catch (error) {
      console.error('Error opening auth URL:', error);
      setError(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Preparing authentication for {serviceName}...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Try Again" onPress={() => window.location.reload()} />
        <Button title="Cancel" onPress={onCancel} type="secondary" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentication Required</Text>
      <Text style={styles.text}>
        To use {serviceName}, you need to grant August permission to access your account.
      </Text>
      <View style={styles.buttonContainer}>
        <Button 
          title={`Authenticate with ${serviceName}`} 
          onPress={handleAuthPress} 
        />
        <Button 
          title="Cancel" 
          onPress={onCancel} 
          type="secondary" 
          style={styles.cancelButton} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#d9534f',
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 10,
  },
  cancelButton: {
    marginTop: 10,
  },
});

export default AuthRedirect;
