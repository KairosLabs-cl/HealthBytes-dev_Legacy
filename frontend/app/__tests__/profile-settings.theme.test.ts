import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const layoutSource = readFileSync(resolve(__dirname, "../_layout.tsx"), "utf8");
const settingsSource = readFileSync(
  resolve(__dirname, "../profile-settings.tsx"),
  "utf8"
);

describe("account settings theme selector", () => {
  it("mounts the preference-aware theme provider globally", () => {
    expect(layoutSource).toContain(
      'import { AppThemeProvider } from "@/components/AppThemeProvider";'
    );
    expect(layoutSource).toContain("<AppThemeProvider>");
  });

  it("shows application settings with automatic, light and dark modes", () => {
    expect(settingsSource).toContain("Configuraciones de la aplicación");
    expect(settingsSource).toContain("Automático");
    expect(settingsSource).toContain("Claro");
    expect(settingsSource).toContain("Oscuro");
  });
});
