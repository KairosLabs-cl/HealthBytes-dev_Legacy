import { getAppTheme } from "@/lib/theme";
import {
  resolveThemePreference,
  type ThemePreference,
} from "@/lib/themePreference";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useColorScheme, type ColorSchemeName } from "react-native";

export function getAppThemeState(
  themePreference: ThemePreference,
  systemColorScheme: ColorSchemeName
) {
  const resolvedMode = resolveThemePreference(
    themePreference,
    systemColorScheme
  );
  const isDark = resolvedMode === "dark";

  return {
    themePreference,
    resolvedMode,
    isDark,
    statusBarStyle: isDark ? ("light" as const) : ("dark" as const),
    palette: getAppTheme(resolvedMode),
  };
}

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const themePreference = usePreferencesStore((state) => state.themePreference);

  return getAppThemeState(themePreference, systemColorScheme);
}
