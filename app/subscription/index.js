import React from 'react';
import { View, StatusBar, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import SubscriptionScreen from '../../screens/SubscriptionScreen';
import GradientBackground from '../../components/GradientBackground';
import { colors } from '../../constants/Theme';
import { layoutStyles } from '../../constants/StyleGuide';

export default function SubscriptionPage() {
  return (
    <GradientBackground colors={[colors.black, colors.darkGray]}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={layoutStyles.safeArea}>
        <Stack.Screen options={{ 
          headerShown: false
        }} />
        <View style={layoutStyles.container}>
          <SubscriptionScreen />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
