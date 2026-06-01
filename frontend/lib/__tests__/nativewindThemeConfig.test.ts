import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const tailwindConfig = require("../../tailwind.config");
const globalCss = readFileSync(resolve(__dirname, "../../global.css"), "utf8");

describe("NativeWind theme configuration", () => {
  it("uses class dark mode when theme can be changed manually", () => {
    expect(tailwindConfig.darkMode).toBe("class");
  });

  it("applies custom dark tokens from the root dark class", () => {
    expect(globalCss).toMatch(/\.dark\s*{/);
    expect(globalCss).not.toContain("@media (prefers-color-scheme: dark)");
  });
});
