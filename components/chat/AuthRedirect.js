import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import Button from '../Button';
import { checkToolAuth } from '../../services/api';
import composioService from '../../services/composio';
import * as WebBrowser from 'expo-web-browser';
import DynamicAuthBlob from '../../components/chat/DynamicAuthBlob';

/**
 * Component to handle authentication redirects for tools
 * @param {Object} props - Component props
 * @param {String} props.serviceName - Name of the service to authenticate with
 * @param {String} props.redirectUrl - URL to redirect to for authentication
 * @param {Function} props.onAuthComplete - Callback for when authentication is complete. Should update auth state and retry the last action.
 * @param {Function} props.onCancel - Callback for when authentication is cancelled
 */
const AuthRedirect = ({ serviceName, redirectUrl, onAuthComplete, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle deep linking for auth callbacks
  useEffect(() => {
    // Set up a listener for when the app is opened via URL (auth callback)
    const handleUrl = async (event) => {
      const url = event.url;
      console.log('Deep link detected:', url);

      // Check for auth callback with more detailed logging
      if (url.includes('auth/callback')) {
        console.log(`Processing auth callback for ${serviceName}...`);
        try {
          // Extract parameters from URL for debugging
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get('code');
          const state = urlObj.searchParams.get('state');
          const connectedAccountId = urlObj.searchParams.get('connectedAccountId');

          console.log('Auth callback parameters:', {
            hasCode: !!code,
            hasState: !!state,
            hasConnectedAccountId: !!connectedAccountId,
            service: serviceName
          });

          if (!code || !connectedAccountId) {
            throw new Error(`Missing required parameters in callback URL. Needs code and connectedAccountId.`);
          }

          // Handle the OAuth callback
          const result = await composioService.handleOAuthCallback(url);

          if (result.success) {
            console.log('Authentication successful:', result);
            // Update auth state and retry last action
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
        console.log(`Initial URL detected: ${url}`);
        handleUrl({ url });
      } else {
        console.log('No initial URL detected');
      }
    });

    // Clean up
    return () => {
      subscription.remove();
    };
  }, [serviceName, onAuthComplete]);

  // Handle authentication button press immediately when component mounts
  useEffect(() => {
    if (redirectUrl) {
      handleAuthPress();
    } else {
      setError('No redirect URL provided');
    }
  }, [redirectUrl]);

  // Handle authentication button press
  const handleAuthPress = async () => {
    if (!redirectUrl) {
      setError('No redirect URL provided');
      return;
    }

    try {
      console.log(`Opening auth URL: ${redirectUrl}`);
      setLoading(true);

      // Open auth URL in browser
      if (Platform.OS === 'web') {
        window.open(redirectUrl, '_blank');
      } else {
        await WebBrowser.openAuthSessionAsync(redirectUrl);
      }
    } catch (error) {
      console.error('Error opening auth URL:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Using our new DynamicAuthBlob for all states
  return (
    <View style={styles.container}>
      <DynamicAuthBlob
        service={serviceName}
        isLoading={loading}
        isConnected={false}
        error={error}
        onAuthenticate={handleAuthPress}
        onErrorDismiss={() => window.location.reload()}
        size="large"
      />

      {!loading && !error && (
        <Text style={styles.helpText}>
          You'll be redirected to {serviceName} to authorize August. After completing authorization,
          you'll be returned to this app automatically.
        </Text>
      )}

      <Button
        title="Cancel"
        onPress={onCancel}
        type="secondary"
        style={styles.cancelButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginVertical: 10,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    marginVertical: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: '80%',
  },
  cancelButton: {
    marginTop: 10,
  },
});

export default AuthRedirect;
