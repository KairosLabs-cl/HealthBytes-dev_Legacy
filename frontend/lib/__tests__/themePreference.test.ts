import { resolveThemePreference } from "@/lib/themePreference";

describe("theme preference helpers", () => {
  it("uses explicit light and dark preferences", () => {
    expect(resolveThemePreference("light", "dark")).toBe("light");
    expect(resolveThemePreference("dark", "light")).toBe("dark");
  });

  it("uses system scheme when preference is system", () => {
    expect(resolveThemePreference("system", "dark")).toBe("dark");
    expect(resolveThemePreference("system", "light")).toBe("light");
  });

  it("falls back to light when system scheme is unavailable", () => {
    expect(resolveThemePreference("system", null)).toBe("light");
  });
});
