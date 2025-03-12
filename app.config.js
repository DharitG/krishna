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
  plugins: [],
  extra: {
    // Azure OpenAI Configuration
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    
    // Optional: Model configuration
    MODEL_TEMPERATURE: process.env.MODEL_TEMPERATURE,
    MODEL_MAX_TOKENS: process.env.MODEL_MAX_TOKENS,
    
    eas: {
      projectId: "your-project-id"
    }
  }
};