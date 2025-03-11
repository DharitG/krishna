// Modern design system for August AI
// Enhanced with component styles inspired by the settings page

export const colors = {
  // Base colors
  black: '#121214',
  darkGray: '#1E1E22',
  gray: '#2D2D34',
  lightGray: '#8E8EA0',
  offWhite: '#F0F0F5',
  white: '#FFFFFF',
  
  // Accent colors
  emerald: '#10B981',
  emeraldLight: '#34D399',
  purple: '#8B5CF6',
  purpleDark: '#6D28D9',
  
  // Gradient definitions
  gradients: {
    primary: ['#10B981', '#8B5CF6'],
    secondary: ['#6D28D9', '#34D399'],
    glow: ['rgba(16, 185, 129, 0.6)', 'rgba(139, 92, 246, 0.6)']
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  round: 9999
};

export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4
  },
  glow: {
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6
  },
  purpleGlow: {
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6
  }
};

// Glass morphism effect - for use with backgrounds
export const glassMorphism = {
  backgroundColor: 'rgba(30, 30, 34, 0.75)',
  backdropFilter: 'blur(10px)',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 1
};

// Typography
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System'
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40
  }
};

// Animation durations
export const animation = {
  fast: 200,
  normal: 300,
  slow: 500
};