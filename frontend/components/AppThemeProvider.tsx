import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { resolveThemePreference } from "@/lib/themePreference";
import { usePreferencesStore } from "@/store/preferencesStore";
import type React from "react";
import { useColorScheme } from "react-native";

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const themePreference = usePreferencesStore((state) => state.themePreference);
  const resolvedTheme = resolveThemePreference(themePreference, systemColorScheme);

  return (
    <GluestackUIProvider mode={resolvedTheme}>{children}</GluestackUIProvider>
  );
}
