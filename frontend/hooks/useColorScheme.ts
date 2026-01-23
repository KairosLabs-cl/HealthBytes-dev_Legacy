import { useColorScheme as useRNColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';

/**
 * Custom hook for color scheme detection
 * Returns the current color scheme (light or dark)
 * Falls back to 'light' if undefined
 * 
 * @returns Current color scheme
 */
export function useColorScheme(): ColorScheme {
  const scheme = useRNColorScheme();
  return scheme ?? 'light';
}

/**
 * Check if dark mode is active
 * 
 * @returns true if dark mode is active
 */
export function useDarkMode(): boolean {
  const scheme = useColorScheme();
  return scheme === 'dark';
}
