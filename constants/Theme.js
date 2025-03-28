// Modern design system for August AI
// Enhanced with semantic tokens and component-specific styles

// Base colors
const baseColors = {
  black: '#121214',
  darkGray: '#1E1E22',
  gray: '#2D2D34',
  lightGray: '#8E8EA0',
  offWhite: '#F0F0F5',
  white: '#FFFFFF',
  
  // Theme colors
  backgroundStart: '#0A0F2C',
  backgroundEnd: '#0E1233',
  primaryText: '#BFD6FF',
  secondaryText: '#9BB1DD',
  buttonBackground: '#1B2A4B',
  inputBackground: '#14203D',
  
  // Accent colors
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldTransparent: 'rgba(16, 185, 129, 0.25)',
  purple: '#8B5CF6',
  purpleDark: '#6D28D9',
  
  // Status colors
  warning: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',
  info: '#3B82F6',
};

// Semantic color tokens
export const colors = {
  ...baseColors,
  
  // Background colors
  background: {
    primary: baseColors.backgroundStart,
    secondary: baseColors.backgroundEnd,
    tertiary: baseColors.buttonBackground,
    card: baseColors.inputBackground,
    input: baseColors.inputBackground,
    overlay: 'rgba(18, 18, 20, 0.8)',
  },
  
  // Text colors
  text: {
    primary: baseColors.primaryText,
    secondary: baseColors.secondaryText,
    tertiary: baseColors.lightGray,
    inverse: baseColors.black,
    error: baseColors.error,
    success: baseColors.success,
    warning: baseColors.warning,
    info: baseColors.info,
  },
  
  // Border colors
  border: {
    primary: 'rgba(255, 255, 255, 0.1)',
    secondary: 'rgba(255, 255, 255, 0.05)',
    focus: baseColors.emerald,
    error: baseColors.error,
  },
  
  // Interactive colors
  interactive: {
    primary: baseColors.emerald,
    secondary: baseColors.purple,
    hover: baseColors.emeraldLight,
    active: baseColors.purpleDark,
    disabled: baseColors.lightGray,
  },
  
  // Gradient definitions
  gradients: {
    primary: [baseColors.backgroundStart, baseColors.backgroundEnd],
    secondary: [baseColors.purpleDark, baseColors.emeraldLight],
    glow: ['rgba(16, 185, 129, 0.6)', 'rgba(139, 92, 246, 0.6)'],
    overlay: ['rgba(18, 18, 20, 0.8)', 'rgba(18, 18, 20, 0.95)'],
    chat: ['#060818', '#0A0F2C', '#0E1233']
  }
};

// Spacing system
export const spacing = {
  // Base spacing units
  base: 4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Component-specific spacing
  container: {
    padding: 16,
    margin: 16,
  },
  section: {
    padding: 24,
    margin: 24,
  },
  card: {
    padding: 16,
    margin: 8,
  },
  input: {
    padding: 12,
    margin: 8,
  },
};

// Border radius system
export const borderRadius = {
  // Base radius units
  base: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  round: 9999,
  
  // Component-specific radius
  button: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  card: {
    default: 16,
    large: 24,
  },
  input: {
    default: 8,
    large: 12,
  },
};

// Shadow system
export const shadows = {
  // Base shadows
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
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8
  },
  
  // Component-specific shadows
  card: {
    default: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2
    },
    elevated: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4
    }
  },
  button: {
    default: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    primary: {
      shadowColor: colors.emerald,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 6
    }
  }
};

// Glass morphism effects
export const glassMorphism = {
  light: {
    backgroundColor: 'rgba(30, 30, 34, 0.75)',
    backdropFilter: 'blur(10px)',
    borderColor: colors.border.primary,
    borderWidth: 1
  },
  dark: {
    backgroundColor: 'rgba(18, 18, 20, 0.85)',
    backdropFilter: 'blur(12px)',
    borderColor: colors.border.secondary,
    borderWidth: 1
  }
};

// Typography system
export const typography = {
  // Font families
  fontFamily: {
    regular: 'InterVariable',
    medium: 'Inter-Medium',
    light: 'Inter-Light',
    black: 'Inter-Black',
    bold: 'InterDisplay-Bold',
    mono: 'InterVariable',
    brand: 'InterDisplay-Bold'
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40
  },
  
  // Line heights
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40
  },
  
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  
  // Component-specific typography
  heading: {
    h1: {
      fontSize: 40,
      lineHeight: 48,
      fontWeight: '700'
    },
    h2: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700'
    },
    h3: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600'
    },
    h4: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600'
    }
  },
  body: {
    large: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400'
    },
    medium: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400'
    },
    small: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400'
    }
  }
};

// Animation system
export const animation = {
  // Duration
  duration: {
    fast: 200,
    normal: 300,
    slow: 500
  },
  
  // Timing functions
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  },
  
  // Component-specific animations
  button: {
    press: {
      scale: 0.98,
      duration: 100
    }
  },
  card: {
    hover: {
      scale: 1.02,
      duration: 200
    }
  }
};

// Breakpoints for responsive design
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
};

// Z-index system
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070
};
