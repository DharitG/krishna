import React from 'react';
import { Redirect } from 'expo-router';

export default function TabsIndex() {
  // Redirect to the chat screen when landing on /tabs
  return <Redirect href="/tabs/chat" />;
}