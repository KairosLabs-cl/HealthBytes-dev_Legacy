import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const tailwindConfig = require("../../tailwind.config");
const globalCss = readFileSync(resolve(__dirname, "../../global.css"), "utf8");
const gluestackConfig = readFileSync(
  resolve(__dirname, "../../components/ui/gluestack-ui-provider/config.ts"),
  "utf8"
);

describe("NativeWind theme configuration", () => {
  it("uses class dark mode when theme can be changed manually", () => {
    expect(tailwindConfig.darkMode).toBe("class");
  });

  it("applies custom dark tokens from the root dark class", () => {
    expect(globalCss).toMatch(/\.dark\s*{/);
    expect(globalCss).not.toContain("@media (prefers-color-scheme: dark)");
  });

  it("maps semantic Tailwind colors to dynamic variables", () => {
    const colors = tailwindConfig.theme.extend.colors;

    expect(colors["surface-warm"]).toBe(
      "rgb(var(--color-surface-warm)/<alpha-value>)"
    );
    expect(colors["surface-card"]).toBe(
      "rgb(var(--color-surface-card)/<alpha-value>)"
    );
    expect(colors.ink).toBe("rgb(var(--color-ink-primary)/<alpha-value>)");
    expect(colors["ink-muted"]).toBe(
      "rgb(var(--color-ink-muted)/<alpha-value>)"
    );
    expect(colors["border-subtle"]).toBe(
      "rgb(var(--color-border-subtle)/<alpha-value>)"
    );
    expect(colors["accent-primary"]).toBe(
      "rgb(var(--color-accent-primary)/<alpha-value>)"
    );
  });

  it("defines semantic color variables for native and web providers", () => {
    expect(gluestackConfig.match(/"--color-surface-warm"/g)).toHaveLength(2);
    expect(gluestackConfig.match(/"--color-ink-primary"/g)).toHaveLength(2);
    expect(gluestackConfig.match(/"--color-icon-muted"/g)).toHaveLength(2);
    expect(gluestackConfig.match(/"--color-state-success"/g)).toHaveLength(2);
  });

  it("keeps CSS aliases dynamic and exposes tertiary zero", () => {
    expect(globalCss).toContain(
      "--surface-warm: rgb(var(--color-surface-warm));"
    );
    expect(globalCss).toContain("--ink: rgb(var(--color-ink-primary));");
    expect(tailwindConfig.theme.extend.colors.tertiary[0]).toBe(
      "rgb(var(--color-tertiary-0)/<alpha-value>)"
    );
  });
});
