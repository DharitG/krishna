import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  Alert,
} from 'react-native';
import LoadingIndicator from '../../components/LoadingIndicator';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../services/authContext';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/Theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (error) {
      // Error is already handled in the auth context
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      
      <LinearGradient
        colors={colors.gradients.primary}
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
        <Text style={styles.tagline}>Reset your password</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Forgot Password</Text>
        
        {submitted ? (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successMessage}>
              We've sent a password reset link to {email}. 
              Please check your inbox and follow the instructions to reset your password.
            </Text>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={navigateToLogin}
            >
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.instructions}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.lightGray}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backToLogin} 
              onPress={navigateToLogin}
            >
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
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
    width: 60,
    height: 60,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.brand,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: typography.fontSize.md,
    color: colors.lightGray,
    marginBottom: spacing.xl,
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.darkGray,
    marginTop: spacing.xl,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  instructions: {
    color: colors.lightGray,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.offWhite,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.gray,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    color: colors.white,
    fontSize: typography.fontSize.md,
  },
  resetButton: {
    backgroundColor: colors.purple,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  backToLogin: {
    alignSelf: 'center',
  },
  backToLoginText: {
    color: colors.emerald,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  successTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.emerald,
    marginBottom: spacing.md,
  },
  successMessage: {
    color: colors.lightGray,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.emerald,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  backButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
});