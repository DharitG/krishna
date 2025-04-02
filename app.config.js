import 'dotenv/config';

export default {
  name: 'August',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#121212'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.august'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#121212'
    },
    package: 'com.yourcompany.august'
  },
  web: {
    favicon: './assets/images/favicon.png'
  },
  plugins: [
    [
      'expo-secure-store',
      {
        faceIDPermission: 'Allow August to access your Face ID biometrics'
      }
    ]
  ],
  scheme: 'august',
  extra: {
    // Supabase Configuration
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    
    // Feature flags to replace API keys
    FEATURE_AZURE_OPENAI: true,
    FEATURE_COMPOSIO: true,
    
    // Azure OpenAI Configuration (still needed but without keys)
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    
    // Optional: Model configuration
    MODEL_TEMPERATURE: process.env.MODEL_TEMPERATURE,
    MODEL_MAX_TOKENS: process.env.MODEL_MAX_TOKENS,
    
    // Backend Configuration
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
    
    // RevenueCat Configuration
    REVENUECAT_IOS_API_KEY: process.env.REVENUECAT_IOS_API_KEY,
    REVENUECAT_ANDROID_API_KEY: process.env.REVENUECAT_ANDROID_API_KEY,
    
    eas: {
      projectId: "your-project-id"
    }
  }
};