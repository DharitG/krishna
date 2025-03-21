// New theme system based on the provided design
export const theme = {
  colors: {
    background: "#000000",
    card: "#121212",
    cardLight: "#222222",
    primary: "#06C167", // Uber green as our primary color
    secondary: "#333333",
    text: {
      primary: "#FFFFFF",
      secondary: "#999999",
      muted: "#666666",
    },
    border: "#333333",
    error: "#FF4D4F",
    success: "#06C167",
    gradients: {
      github: ["#121212", "#4078c0"],
      gmail: ["#121212", "#EA4335"],
      slack: ["#121212", "#611f69"],
      calendar: ["#121212", "#0F9D58"],
      dropbox: ["#121212", "#0061FF"],
      asana: ["#121212", "#FC636B"],
      default: ["#121212", "#06C167"],
    },
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 2
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 8
    },
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
  },
};

export default theme;
