import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../services/authContext';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/Theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      await signIn(email, password);
      router.replace('/');
    } catch (error) {
      // Error is already handled in the auth context
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignUp = () => {
    router.push('/auth/signup');
  };

  const navigateToForgotPassword = () => {
    router.push('/auth/forgot-password');
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
        <Text style={styles.tagline}>Your AI Super Agent</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Log In</Text>
        
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

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.lightGray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.forgotPassword} 
          onPress={navigateToForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={navigateToSignUp}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    color: colors.emerald,
    fontSize: typography.fontSize.sm,
  },
  loginButton: {
    backgroundColor: colors.emerald,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: colors.lightGray,
    fontSize: typography.fontSize.sm,
  },
  signupLink: {
    color: colors.purple,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
});