import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../services/authContext';
import { colors } from '../constants/Theme';
import LoadingIndicator from '../components/LoadingIndicator';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  // Wait for auth to initialize
  useEffect(() => {
    if (!loading) {
      // Wait a bit more to ensure everything is loaded
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator size="large" color={colors.info} />
      </View>
    );
  }

  // Redirect based on authentication status
  return isAuthenticated ? <Redirect href="/tabs" /> : <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
});
