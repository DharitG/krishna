import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen after resources are loaded
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}
