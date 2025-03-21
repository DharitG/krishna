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
import { Svg, Path, Circle } from 'react-native-svg';
import { useAuth } from '../../services/authContext';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/Theme';
import theme from '../../constants/NewTheme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Hello Again!</Text>
            <Text style={styles.subtitle}>Welcome Back You've been missed</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <MailIcon />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.colors.text.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <LockIcon />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.colors.text.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.forgotPassword} 
              onPress={navigateToForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleButton}>
              <View style={styles.socialIconContainer}>
                <GoogleIcon />
              </View>
              <Text style={styles.buttonText}>Sign With Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.appleButton}>
              <View style={styles.socialIconContainer}>
                <AppleIcon />
              </View>
              <Text style={styles.buttonText}>Sign With Apple</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't Have Account?{' '}
              <Text style={styles.footerLink} onPress={navigateToSignUp}>
                Sign Up
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function MailIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.colors.text.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <Path d="M22 6l-10 7L2 6" />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.colors.text.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z" />
      <Path d="M7 11V7a5 5 0 0110 0v4" />
    </Svg>
  );
}

function EyeIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.colors.text.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

function EyeOffIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.colors.text.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <Path d="M1 1l22 22" />
    </Svg>
  );
}

function GoogleIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function AppleIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.05 12.536c-.021-2.403 1.97-3.58 2.062-3.633-1.128-1.646-2.878-1.873-3.493-1.89-1.466-.154-2.896.877-3.645.877-.77 0-1.935-.862-3.19-.837-1.614.024-3.13.956-3.965 2.404-1.718 2.976-.437 7.35 1.208 9.758.823 1.176 1.783 2.49 3.043 2.444 1.23-.05 1.69-.785 3.177-.785 1.467 0 1.898.785 3.177.757 1.317-.021 2.147-1.185 2.94-2.37.95-1.36 1.33-2.7 1.348-2.77-.03-.01-2.57-.98-2.6-3.91l-.062-.045z"
        fill="white"
      />
      <Path
        d="M14.918 6.574c.66-.823 1.116-1.95 1.002-3.094-.968.042-2.178.663-2.876 1.465-.617.724-1.172 1.91-1.028 3.022 1.092.082 2.208-.55 2.902-1.393z"
        fill="white"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: theme.spacing["3xl"],
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSizes["2xl"],
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: theme.spacing["3xl"],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  iconContainer: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    color: theme.colors.text.primary,
    fontSize: theme.fontSizes.md,
    paddingVertical: theme.spacing.md,
  },
  eyeIcon: {
    paddingHorizontal: theme.spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  forgotPasswordText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSizes.sm,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    height: 50,
    justifyContent: 'center',
  },
  loginButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSizes.sm,
    marginHorizontal: theme.spacing.md,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  socialIconContainer: {
    marginRight: theme.spacing.md,
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSizes.sm,
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
});