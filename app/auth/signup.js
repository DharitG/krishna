import React, { useState, useRef, useEffect } from 'react';
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
  Image,
  ImageBackground,
  Dimensions,
  SafeAreaView,
  Animated
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Circle } from 'react-native-svg';
import { useAuth } from '../../services/authContext';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/Theme';
import theme from '../../constants/NewTheme';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const formHeight = useRef(new Animated.Value(0)).current;
  const buttonContainerPadding = useRef(new Animated.Value(32)).current;
  const { signUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (showEmailForm) {
      // Animate form height and reduce top padding
      Animated.parallel([
        Animated.timing(formHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(buttonContainerPadding, {
          toValue: 16,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    } else {
      // Animate form height back to 0 and restore padding
      Animated.parallel([
        Animated.timing(formHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(buttonContainerPadding, {
          toValue: 32,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    }
  }, [showEmailForm]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSignup = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password);
      router.replace('/');
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

  const handleCancel = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Top half with image and logo */}
      <View style={[styles.topSection, showEmailForm && styles.topSectionSmaller]}>
        {/* Cancel button */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        {/* Background image with gradient overlay */}
        <ImageBackground 
          source={require('../../assets/images/backgrounds/utopia.jpeg')} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Gradient overlay */}
          <LinearGradient
            colors={[
              'transparent',
              'transparent',
              'transparent',
              'rgba(0,0,0,0.3)',
              'rgba(0,0,0,0.6)',
              'rgba(0,0,0,0.9)',
              'black'
            ]}
            locations={[0, 0.3, 0.5, 0.7, 0.8, 0.9, 1]}
            style={styles.gradientOverlay}
          />

          {/* Logo and title */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <LogoIcon />
            </View>
            <Text style={styles.appTitle}>August</Text>
          </View>
        </ImageBackground>
      </View>

      {/* Bottom half with signup options */}
      <Animated.View 
        style={[
          styles.bottomSection, 
          { paddingTop: buttonContainerPadding }
        ]}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.buttonContainer}>
            {/* Google signup button */}
            <TouchableOpacity 
              style={styles.googleButton}
              activeOpacity={0.8}
            >
              <GoogleIcon />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Apple signup button */}
            <TouchableOpacity 
              style={styles.appleButton}
              activeOpacity={0.8}
            >
              <AppleIcon />
              <Text style={styles.buttonText}>Continue with Apple</Text>
            </TouchableOpacity>

            {/* Email signup button */}
            <TouchableOpacity 
              style={[styles.emailButton, showEmailForm && styles.emailButtonActive]}
              activeOpacity={0.8}
              onPress={() => setShowEmailForm(!showEmailForm)}
            >
              <Text style={styles.buttonText}>Continue with email</Text>
            </TouchableOpacity>

            {/* Email and password fields - shown/hidden based on state */}
            <Animated.View 
              style={[
                styles.formContainer,
                {
                  maxHeight: formHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 300]
                  }),
                  opacity: formHeight
                }
              ]}
            >
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmail(text);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>
              
              <View style={styles.inputContainer}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, passwordError ? styles.inputError : null]}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) validatePassword(text);
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>
              
              <View style={styles.inputContainer}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, confirmPasswordError ? styles.inputError : null]}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) validateConfirmPassword(text);
                    }}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
              </View>

              <TouchableOpacity 
                style={styles.signupButton}
                onPress={handleSignup}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer links */}
          <View style={styles.footer}>
            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Privacy policy</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Terms of service</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.signupLink}>
                Already have an account? <Text style={styles.signupLinkText}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
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

function EyeIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

function EyeOffIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <Path d="M1 1l22 22" />
    </Svg>
  );
}

function LogoIcon() {
  return (
    <Svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <Path d="M32 4L4 32L32 60L60 32L32 4Z" stroke="white" strokeWidth="4" fill="none" />
      <Path d="M32 4L32 60" stroke="white" strokeWidth="4" />
      <Path d="M4 32L60 32" stroke="white" strokeWidth="4" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topSection: {
    height: height * 0.55,
    position: 'relative',
  },
  topSectionSmaller: {
    height: height * 0.35,
  },
  cancelButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 10,
  },
  cancelText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  logoContainer: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logoWrapper: {
    width: 64,
    height: 64,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 36,
    color: 'white',
    fontWeight: '300',
    letterSpacing: 1,
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flex: 1,
    gap: 16,
  },
  googleButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
  emailButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#222222',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailButtonActive: {
    borderColor: '#06C167',
  },
  appleButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#222222',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    overflow: 'hidden',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#222222',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 12,
    color: 'white',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  signupButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#06C167',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 16,
  },
  footerLink: {
    color: '#999999',
    fontSize: 14,
  },
  signupLink: {
    color: '#999999',
    fontSize: 14,
    textAlign: 'center',
  },
  signupLinkText: {
    color: '#06C167',
    fontWeight: '500',
  },
});
