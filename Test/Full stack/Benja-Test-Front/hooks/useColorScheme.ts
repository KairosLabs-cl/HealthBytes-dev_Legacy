/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useAppSettings } from '@/contexts/AppSettingsContext';

// Utilizamos nuestro propio sistema de temas en lugar del sistema nativo
export function useColorScheme(): 'light' | 'dark' {
  const { resolvedTheme } = useAppSettings();
  return resolvedTheme;
}