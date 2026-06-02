import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { usePreferencesStore } from "@/store/preferencesStore";
import type React from "react";

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const themePreference = usePreferencesStore((state) => state.themePreference);

  return (
    <GluestackUIProvider mode={themePreference}>{children}</GluestackUIProvider>
  );
}
