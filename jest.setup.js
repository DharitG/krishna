// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      SUPABASE_URL: 'https://test-project.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key',
      BACKEND_URL: 'http://localhost:3001',
      FEATURE_AZURE_OPENAI: true,
      FEATURE_COMPOSIO: true
    }
  }
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  useLocalSearchParams: jest.fn().mockReturnValue({}),
  Link: 'Link',
  Redirect: 'Redirect',
  Stack: 'Stack',
  Tabs: 'Tabs'
}));

// Mock react-native components
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock socket.io
jest.mock('socket.io-client', () => {
  const mockOn = jest.fn();
  const mockEmit = jest.fn();
  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();
  
  return jest.fn(() => ({
    on: mockOn,
    emit: mockEmit,
    connect: mockConnect,
    disconnect: mockDisconnect
  }));
});

// Global setup
global.fetch = jest.fn();

// Silence console errors during tests
console.error = jest.fn();

// Global test timeout
jest.setTimeout(10000);
