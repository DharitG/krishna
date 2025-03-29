// Unified Theme System for August AI
// This file combines the styles from Theme.js and NewTheme.js 
// while preserving all original values and adding component-specific hardcoded values

// ============================================================
// BASE COLORS
// ============================================================
const baseColors = {
  // Core colors from Theme.js
  black: '#121214',
  darkGray: '#1E1E22',
  gray: '#2D2D34',
  lightGray: '#8E8EA0',
  offWhite: '#F0F0F5',
  white: '#FFFFFF',
  
  // Theme colors from Theme.js
  backgroundTop: '#020305',
  backgroundMid1: '#061022',
  backgroundMid2: '#0A1D45',
  backgroundMid3: '#102C68',
  backgroundBottom: '#1F4ACC',
  primaryText: '#BFD6FF',
  secondaryText: '#9BB1DD',
  buttonBackground: 'rgba(26, 44, 75, 0.8)',
  inputBackground: 'rgba(20, 32, 61, 0.85)',
  
  // Accent colors from Theme.js
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldTransparent: 'rgba(16, 185, 129, 0.25)',
  purple: '#8B5CF6',
  purpleDark: '#6D28D9',
  
  // Status colors from Theme.js
  warning: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',
  info: '#3B82F6',
  
  // Additional hardcoded colors from components
  chatInputBackground: '#0C1B3B',
  buttonBlue: '#1D4ED8',
  buttonBlueDarker: '#173A63',
  sidebarBackground: '#0A1428',
  placeholderBlue: '#8BAEDC',
  shadowBlue: '#1E90FF',
  chatBubbleGradient: 'rgba(26, 44, 75, 0.6)',
  chatBubbleBorder: 'rgba(48, 109, 255, 0.2)',
};

// ============================================================
// THEME.JS STYLE EXPORTS (FLAT STRUCTURE)
// ============================================================

// Semantic color tokens (from Theme.js)
export const colors = {
  ...baseColors,
  
  // Background colors
  background: {
    primary: baseColors.backgroundTop,
    secondary: baseColors.backgroundBottom,
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
    primary: [baseColors.backgroundTop, baseColors.backgroundMid1, baseColors.backgroundBottom],
    secondary: [baseColors.purpleDark, baseColors.emeraldLight],
    glow: ['rgba(48, 109, 255, 0.6)', 'rgba(11, 12, 29, 0.6)'],
    overlay: ['rgba(18, 18, 20, 0.8)', 'rgba(18, 18, 20, 0.95)'],
    chat: [
      baseColors.backgroundTop,
      baseColors.backgroundMid1,
      baseColors.backgroundMid2,
      baseColors.backgroundMid3,
      baseColors.backgroundBottom
    ],
    // Gradients from NewTheme.js
    github: ['#2A2F3A', '#4078c0'],
    gmail: ['#4285F4', '#EA4335'],
    slack: ['#4A154B', '#611f69'],
    calendar: ['#0F9D58', '#4285F4'],
    dropbox: ['#0061FF', '#00BFFF'],
    asana: ['#FC636B', '#FF8450'],
    default: ['#2DD4BF', '#7C3AED'],
  }
};

// Spacing system (from Theme.js)
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

// Border radius system (from Theme.js)
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

// Typography system (from Theme.js)
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

// Shadow system (from Theme.js)
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
  
  // Shadow from NewTheme.js
  newThemeLg: '0 10px 20px rgba(0, 0, 0, 0.3)',
  
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
  },
  // Hardcoded MessageInput shadow
  messageInput: {
    shadowColor: baseColors.shadowBlue,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10
  }
};

// Glass morphism effects (from Theme.js)
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
  },
  chatBubble: {
    backgroundColor: 'rgba(26, 44, 75, 0.6)',
    backdropFilter: 'blur(12px)',
    borderColor: 'rgba(48, 109, 255, 0.2)',
    borderWidth: 1,
    shadowColor: '#306DFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4
  },
  chatInput: {
    backgroundColor: 'rgba(20, 32, 61, 0.85)',
    backdropFilter: 'blur(12px)',
    borderColor: 'rgba(48, 109, 255, 0.15)',
    borderWidth: 1,
    shadowColor: '#306DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  }
};

// Breakpoints for responsive design (from Theme.js)
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
};

// Z-index system (from Theme.js)
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

// Animation settings
export const animation = {
  default: {
    type: 'timing',
    duration: 300,
  },
  spring: {
    type: 'spring',
    damping: 20,
    stiffness: 90,
  },
  fast: {
    type: 'timing',
    duration: 150,
  },
  slow: {
    type: 'timing',
    duration: 500,
  },
};

// ============================================================
// NEWTHEME.JS STYLE EXPORTS (NESTED STRUCTURE)
// ============================================================

// This preserves the theme structure from NewTheme.js for backwards compatibility
export const theme = {
  colors: {
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.8)',
    },
    border: 'rgba(255, 255, 255, 0.1)',
    gradients: {
      github: ['#2A2F3A', '#4078c0'],
      gmail: ['#4285F4', '#EA4335'],
      slack: ['#4A154B', '#611f69'],
      calendar: ['#0F9D58', '#4285F4'],
      dropbox: ['#0061FF', '#00BFFF'],
      asana: ['#FC636B', '#FF8450'],
      default: ['#2DD4BF', '#7C3AED'],
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 24,
  },
  shadows: {
    lg: '0 10px 20px rgba(0, 0, 0, 0.3)',
  },
};

// Default export for both compatibility options
export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  glassMorphism,
  breakpoints,
  zIndex,
  animation,
  theme // Nested theme from NewTheme.js
}; 