import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../services/authContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import socketService from '../services/socket';
import { Socket } from 'socket.io-client';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

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
    </GestureHandlerRootView>
  );
}
