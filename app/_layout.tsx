import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { AuthProvider } from '../services/authContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import socketService from '../services/socket';
import { Socket } from 'socket.io-client';
import CustomSplashScreen from '../components/CustomSplashScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    async function loadResources() {
      try {
        await Font.loadAsync({
          'InterVariable': require('../assets/fonts/InterVariable.ttf'),
          'Inter-Medium': require('../assets/fonts/Inter-Medium.otf'),
          'Inter-Light': require('../assets/fonts/Inter-Light.otf'),
          'Inter-Black': require('../assets/fonts/Inter-Black.otf'),
          'InterDisplay-Bold': require('../assets/fonts/InterDisplay-Bold.otf'),
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn('Error loading fonts:', e);
      }
    }

    loadResources();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      // Hide the native splash screen when fonts are loaded
      SplashScreen.hideAsync();
      // Our custom splash screen will remain visible and animate out
    }
  }, [fontsLoaded]);
  
  // Handler for when our custom splash animation completes
  const handleSplashAnimationComplete = () => {
    setShowCustomSplash(false);
  };

  useEffect(() => {
    const initSocket = async () => {
      try {
        await socketService.initializeSocket();
        console.log('WebSocket initialized on app startup');
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
      }
    };
    
    initSocket();
    
    // Clean up WebSocket connection when app is closed
    return () => {
      const cleanupSocket = async () => {
        try {
          const socket = await socketService.getSocket() as Socket | null;
          if (socket) {
            socket.disconnect();
            console.log('WebSocket disconnected on app cleanup');
          }
        } catch (err) {
          console.error('Error disconnecting socket:', err);
        }
      };
      
      cleanupSocket();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthProvider>
          <ProtectedRoute>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />

          </ProtectedRoute>
        </AuthProvider>
      </SafeAreaProvider>
      
      {/* Show our custom animated splash screen */}
      {showCustomSplash && (
        <CustomSplashScreen onAnimationComplete={handleSplashAnimationComplete} />
      )}
    </GestureHandlerRootView>
  );
}
