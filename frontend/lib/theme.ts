/**
 * HealthBytes design tokens.
 *
 * `theme` and convenience exports stay mapped to light mode during the
 * migration. New inline styles should use `getAppTheme` or `useAppTheme`.
 */

const lightColors = {
  surface: {
    warm: "#FCFAF8",
    card: "#FFFFFF",
    elevated: "#FAFAF9",
    muted: "#F5F5F4",
    overlay: "rgba(0,0,0,0.45)",
  },
  ink: {
    primary: "#2D2926",
    muted: "#6B6B6B",
    subtle: "#9CA3AF",
    inverse: "#FFFFFF",
  },
  border: {
    subtle: "#E8E6E3",
    focus: "#2D2926",
    default: "#D1D5DB",
  },
  icon: {
    primary: "#2D2926",
    muted: "#6B6B6B",
    accent: "#2E5C3A",
  },
  accent: {
    primary: "#5C6B5A",
    hover: "#4A5649",
    light: "#F0FDF4",
  },
  state: {
    success: "#4A7C59",
    warning: "#B8860B",
    error: "#9B4D4D",
    info: "#5C6B5A",
  },
  success: "#4A7C59",
  warning: "#B8860B",
  error: "#9B4D4D",
  info: "#5C6B5A",
  brand: {
    green: "#2E5C3A",
    greenLight: "#F0FDF4",
  },
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
} as const;

const darkColors = {
  surface: {
    warm: "#1C1C1E",
    card: "#2C2C2E",
    elevated: "#3A3A3C",
    muted: "#303032",
    overlay: "rgba(0,0,0,0.65)",
  },
  ink: {
    primary: "#F5F0EB",
    muted: "#BEB9B4",
    subtle: "#9CA3AF",
    inverse: "#1C1C1E",
  },
  border: {
    subtle: "#3A3A3C",
    focus: "#F5F0EB",
    default: "#525254",
  },
  icon: {
    primary: "#F5F0EB",
    muted: "#BEB9B4",
    accent: "#4CAF72",
  },
  accent: {
    primary: "#769974",
    hover: "#8CAE8A",
    light: "#203E2A",
  },
  state: {
    success: "#6EB585",
    warning: "#E0B44B",
    error: "#DB8080",
    info: "#7EA4C9",
  },
  success: "#6EB585",
  warning: "#E0B44B",
  error: "#DB8080",
  info: "#7EA4C9",
  brand: {
    green: "#4CAF72",
    greenLight: "#203E2A",
  },
  legacy: {
    white: "#1C1C1E",
    black: "#F5F0EB",
    gray: {
      50: "#303032",
      100: "#3A3A3C",
      200: "#525254",
      300: "#6B6B6D",
      400: "#8E8E93",
      500: "#AEAEB2",
      600: "#BEB9B4",
      700: "#D1CDCA",
      800: "#E5E1DE",
      900: "#F5F0EB",
    },
  },
} as const;

const sharedTokens = {
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
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
} as const;

export const lightTheme = {
  colors: lightColors,
  ...sharedTokens,
} as const;

export const darkTheme = {
  colors: darkColors,
  ...sharedTokens,
} as const;

export type AppThemeMode = "light" | "dark";
export type AppTheme = typeof lightTheme | typeof darkTheme;

export function getAppTheme(mode: AppThemeMode): AppTheme {
  return mode === "dark" ? darkTheme : lightTheme;
}

// Transitional compatibility for screens not migrated to useAppTheme yet.
export const theme = lightTheme;
export const colors = theme.colors;
export const spacing = theme.spacing;
export const radius = theme.radius;
export const shadows = theme.shadows;
export const typography = theme.typography;

export default theme;
