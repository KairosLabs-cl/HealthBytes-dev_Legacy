/**
 * HealthBytes Typography System
 *
 * Distinctive fonts for a calm, sophisticated aesthetic.
 *
 * Font Selection:
 * - Fraunces: Soft serif with character for headings
 * - Plus Jakarta Sans: Modern geometric sans for body
 */

import * as Font from "expo-font";

// Local font files
const fonts = {
  fraunces: require("../assets/fonts/fraunces.ttf"),
  plusJakarta: require("../assets/fonts/plusjakarta.ttf"),
};

// Font loading - non-blocking
export function useAppFonts() {
  const [fontsLoaded, error] = Font.useFonts({
    Fraunces: fonts.fraunces,
    PlusJakartaSans: fonts.plusJakarta,
  });

  // Return true even if fonts fail to load - app shouldn't be blocked
  return { fontsLoaded: true, error };
}

// Typography scale using our fonts
export const typography = {
  h1: {
    fontFamily: "Fraunces",
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: "Fraunces",
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: "Fraunces",
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h4: {
    fontFamily: "Fraunces",
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 24,
  },
  body: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    fontWeight: "500" as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  },
  button: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  caption: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
  },
  overline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 10,
    fontWeight: "600" as const,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
};

export default { useAppFonts, typography };
