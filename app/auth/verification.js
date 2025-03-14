import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/Theme';

export default function VerificationScreen() {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={colors.gradients.secondary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>August</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Verify Your Email</Text>
        
        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            We've sent a verification email to your inbox. Please check your email and click the verification link to complete your registration.
          </Text>
          
          <Text style={styles.note}>
            If you don't receive the email within a few minutes, please check your spam folder.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={navigateToLogin}
        >
          <Text style={styles.loginButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '50%',
    opacity: 0.2,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl * 2,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.brand,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.darkGray,
    marginTop: spacing.xxl,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.emerald,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  messageContainer: {
    backgroundColor: colors.gray,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  },
  message: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.lg,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  note: {
    color: colors.lightGray,
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: colors.emerald,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
});