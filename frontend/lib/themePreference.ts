import type { ColorSchemeName } from "react-native";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function resolveThemePreference(
  preference: ThemePreference,
  systemColorScheme: ColorSchemeName
): ResolvedTheme {
  if (preference === "light" || preference === "dark") {
    return preference;
  }

  return systemColorScheme === "dark" ? "dark" : "light";
}
