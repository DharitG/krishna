import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { colors } from '../../constants/Theme';
import { ChatCircle } from 'phosphor-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide the tab bar entirely
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Chat",
        }}
      />
    </Tabs>
  );
}