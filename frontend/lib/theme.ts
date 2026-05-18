/**
 * HealthBytes Design Tokens
 *
 * Semantic tokens for consistent theming across the app.
 * Based on the warm, calm aesthetic from checkout-v2.
 *
 * Usage:
 * - Colors: theme.colors.surface.warm, theme.colors.ink, etc.
 * - Spacing: theme.spacing.xs, theme.spacing.md, etc.
 * - BorderRadius: theme.radius.sm, theme.radius.lg, etc.
 */

export const theme = {
  colors: {
    // Background surfaces
    surface: {
      warm: "#FCFAF8", // Main warm background
      card: "#FFFFFF", // Elevated card surfaces
      elevated: "#FAFAF9", // Slightly elevated
      muted: "#F5F5F4", // Dividers, subtle backgrounds
      overlay: "rgba(0,0,0,0.45)", // Modal overlays
    },

    // Text ink system
    ink: {
      primary: "#2D2926", // Primary text (warm charcoal)
      muted: "#6B6B6B", // Secondary text
      subtle: "#9CA3AF", // Tertiary/hints
      inverse: "#FFFFFF", // Text on dark backgrounds
    },

    // Border colors
    border: {
      subtle: "#E8E6E3", // Default borders
      focus: "#2D2926", // Focus states
      default: "#D1D5DB", // Default gray border
    },

    // Accent colors (minimal use)
    accent: {
      primary: "#5C6B5A", // Muted sage green
      hover: "#4A5649", // Darker sage
      light: "#F0FDF4", // Light sage background
    },

    // Semantic colors
    success: "#4A7C59", // Muted forest green
    warning: "#B8860B", // Muted gold
    error: "#9B4D4D", // Muted terracotta
    info: "#5C6B5A", // Same as accent

    // Brand
    brand: {
      green: "#2E5C3A", // Primary brand green
      greenLight: "#F0FDF4", // Light green background
    },

    // Legacy support (mapped to new system)
    legacy: {
      white: "#FFFFFF",
      black: "#111827",
      gray: {
        50: "#F9FAFB",
        100: "#F3F4F6",
        200: "#E5E7EB",
        300: "#D1D5DB",
        400: "#9CA3AF",
        500: "#6B7280",
        600: "#4B5563",
        700: "#374151",
        800: "#1F2937",
        900: "#111827",
      },
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    "4xl": 48,
    "5xl": 64,
  },

  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 24,
    full: 9999,
  },

  shadows: {
    soft: {
      1: "0px 0px 10px rgba(38, 38, 38, 0.1)",
      2: "0px 0px 20px rgba(38, 38, 38, 0.2)",
      3: "0px 0px 30px rgba(38, 38, 38, 0.1)",
    },
    hard: {
      1: "-2px 2px 8px 0px rgba(38, 38, 38, 0.20)",
      2: "0px 3px 10px 0px rgba(38, 38, 38, 0.20)",
    },
    lift: "0px 2px 4px rgba(45, 41, 38, 0.04), 0px 4px 12px rgba(45, 41, 38, 0.04)",
  },

  typography: {
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      "2xl": 20,
      "3xl": 24,
      "4xl": 32,
      "5xl": 40,
    },
    fontWeight: {
      normal: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
      extrabold: "800" as const,
    },
    letterSpacing: {
      tight: -0.3,
      normal: 0,
      wide: 0.2,
      wider: 0.8,
    },
  },

  // Animation durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
} as const;

// Export individual tokens for convenience
export const colors = theme.colors;
export const spacing = theme.spacing;
export const radius = theme.radius;
export const shadows = theme.shadows;
export const typography = theme.typography;

export default theme;
