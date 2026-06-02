import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appThemeProvider = readFileSync(
  resolve(__dirname, "../AppThemeProvider.tsx"),
  "utf8"
);
const webProvider = readFileSync(
  resolve(__dirname, "../ui/gluestack-ui-provider/index.web.tsx"),
  "utf8"
);

describe("AppThemeProvider", () => {
  it("passes raw system preference to Gluestack", () => {
    expect(appThemeProvider).toContain("mode={themePreference}");
    expect(appThemeProvider).not.toContain("resolveThemePreference");
  });

  it("re-applies web class immediately when mode changes to system", () => {
    expect(webProvider).toContain("script(mode);");
  });
});
