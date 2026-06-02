import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const readAppSource = (path: string) =>
  readFileSync(resolve(__dirname, path), "utf8");

const themedScreens = [
  ["profile", readAppSource("../(tabs)/profile.tsx")],
  ["profile settings", readAppSource("../profile-settings.tsx")],
  ["login", readAppSource("../(auth)/login.tsx")],
  ["security", readAppSource("../security.tsx")],
  ["dietary preferences", readAppSource("../dietary-preferences.tsx")],
] as const;

const onboardingSource = readAppSource("../../components/OnboardingModal.tsx");

describe("account and auth dark theme surfaces", () => {
  it.each(themedScreens)(
    "%s consumes the resolved app theme and status bar style",
    (_name, source) => {
      expect(source).toContain(
        'import { useAppTheme } from "@/hooks/useAppTheme";'
      );
      expect(source).toContain(
        "const { palette, statusBarStyle } = useAppTheme();"
      );
      expect(source).toContain("<StatusBar style={statusBarStyle} />");
      expect(source).toContain("palette.colors.surface.warm");
      expect(source).toContain("palette.colors.ink.primary");
      expect(source).toContain("palette.colors.border.subtle");
    }
  );

  it("uses resolved palette colors for onboarding structural inline styles", () => {
    expect(onboardingSource).toContain(
      'import { useAppTheme } from "@/hooks/useAppTheme";'
    );
    expect(onboardingSource).toContain("const { palette } = useAppTheme();");
    expect(onboardingSource).toContain("palette.colors.surface.warm");
    expect(onboardingSource).toContain("palette.colors.surface.card");
    expect(onboardingSource).toContain("palette.colors.ink.primary");
    expect(onboardingSource).toContain("palette.colors.border.subtle");
    expect(onboardingSource).toContain("palette.colors.accent.primary");
  });

  it("does not promise guaranteed dietary suitability", () => {
    expect(onboardingSource).not.toContain("aptos garantizados");
  });
});
