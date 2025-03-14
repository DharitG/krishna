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
  ScrollView,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../services/authContext';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/Theme';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    // Basic form validation
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password should be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, { full_name: name });
      // Note: We don't navigate here since the user needs to verify their email first
      // The alert is shown in the auth context
      router.push('/auth/verification');
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      
      <LinearGradient
        colors={colors.gradients.secondary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>August</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign Up</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.lightGray}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

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
              placeholder="Create a password"
              placeholderTextColor={colors.lightGray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor={colors.lightGray}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.signupButton} 
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginTop: spacing.xxl,
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
    marginTop: spacing.md,
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
  signupButton: {
    backgroundColor: colors.purple,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  signupButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: colors.lightGray,
    fontSize: typography.fontSize.sm,
  },
  loginLink: {
    color: colors.emerald,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
});