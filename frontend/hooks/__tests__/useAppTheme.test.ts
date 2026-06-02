import type { ColorSchemeName } from "react-native";

type AppThemeState = {
  isDark: boolean;
  resolvedMode: "light" | "dark";
  statusBarStyle: "light" | "dark";
  palette: {
    colors: {
      surface: { warm: string };
      ink: { primary: string };
    };
  };
};

type AppThemeHookModule = {
  getAppThemeState?: (
    preference: "system" | "light" | "dark",
    systemColorScheme: ColorSchemeName
  ) => AppThemeState;
};

let hookModule: AppThemeHookModule = {};

try {
  hookModule = require("@/hooks/useAppTheme") as AppThemeHookModule;
} catch {
  // Missing helper is the expected RED state before implementation.
}

describe("getAppThemeState", () => {
  it("resolves system dark mode and status bar style", () => {
    expect(hookModule.getAppThemeState).toEqual(expect.any(Function));
    expect(hookModule.getAppThemeState?.("system", "dark")).toMatchObject({
      resolvedMode: "dark",
      isDark: true,
      statusBarStyle: "light",
    });
  });

  it("keeps explicit light mode when system is dark", () => {
    expect(hookModule.getAppThemeState?.("light", "dark")).toMatchObject({
      resolvedMode: "light",
      isDark: false,
      statusBarStyle: "dark",
    });
  });

  it("returns inline palette for the resolved mode", () => {
    const light = hookModule.getAppThemeState?.("light", "dark");
    const dark = hookModule.getAppThemeState?.("dark", "light");

    expect(light?.palette.colors.surface.warm).not.toBe(
      dark?.palette.colors.surface.warm
    );
    expect(light?.palette.colors.ink.primary).not.toBe(
      dark?.palette.colors.ink.primary
    );
  });
});
