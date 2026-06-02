type ThemeModule = {
  colors: unknown;
  darkTheme?: {
    colors: {
      surface: { warm: string };
      ink: { primary: string };
    };
  };
  getAppTheme?: (mode: "light" | "dark") => {
    colors: {
      surface: { warm: string };
      ink: { primary: string };
    };
  };
  lightTheme?: {
    colors: {
      surface: { warm: string };
      ink: { primary: string };
    };
  };
  theme: {
    colors: unknown;
  };
};

const themeModule = require("@/lib/theme") as ThemeModule;

describe("app theme palettes", () => {
  it("selects explicit light and dark palettes", () => {
    expect(themeModule.getAppTheme).toEqual(expect.any(Function));
    expect(themeModule.getAppTheme?.("light")).toBe(themeModule.lightTheme);
    expect(themeModule.getAppTheme?.("dark")).toBe(themeModule.darkTheme);
  });

  it("provides intentional dark inline colors", () => {
    expect(themeModule.darkTheme?.colors.surface.warm).not.toBe(
      themeModule.lightTheme?.colors.surface.warm
    );
    expect(themeModule.darkTheme?.colors.ink.primary).not.toBe(
      themeModule.lightTheme?.colors.ink.primary
    );
  });

  it("keeps legacy exports mapped to the light palette during migration", () => {
    expect(themeModule.theme).toBe(themeModule.lightTheme);
    expect(themeModule.colors).toBe(themeModule.lightTheme?.colors);
  });
});
