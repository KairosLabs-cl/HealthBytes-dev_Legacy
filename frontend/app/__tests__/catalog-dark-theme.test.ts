import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const readApp = (path: string) =>
  readFileSync(resolve(__dirname, "..", path), "utf8");
const readComponent = (path: string) =>
  readFileSync(resolve(__dirname, "../../components", path), "utf8");

const screenSources = [
  readApp("(tabs)/index.tsx"),
  readApp("all-products.tsx"),
  readApp("search.tsx"),
  readApp("product/[id].tsx"),
];

const paletteSources = [
  readComponent("ProductCard.tsx"),
  readComponent("Header.tsx"),
  readComponent("DietaryFilterBar.tsx"),
];

const catalogSurfaceSources = [
  ...screenSources,
  ...paletteSources,
  readComponent("FavoritesBar.tsx"),
  readComponent("RecentlyViewedBar.tsx"),
  readComponent("DiscountsBar.tsx"),
  readComponent("RecommendationsBar.tsx"),
  readComponent("ReviewCard.tsx"),
];

describe("catalog dark theme migration", () => {
  it("drives catalog status bars from resolved application theme", () => {
    for (const source of screenSources) {
      expect(source).toContain('import { useAppTheme } from "@/hooks/useAppTheme";');
      expect(source).toContain("statusBarStyle");
      expect(source).toContain("<StatusBar style={statusBarStyle} />");
      expect(source).not.toContain('<StatusBar style="dark" />');
    }
  });

  it("uses resolved palette for catalog components with inline structural styles", () => {
    for (const source of paletteSources) {
      expect(source).toContain('import { useAppTheme } from "@/hooks/useAppTheme";');
      expect(source).toContain("palette");
    }

    expect(paletteSources.join("\n")).not.toMatch(
      /backgroundColor:\s*["'](?:#fafafa|#ffffff|#f1f5f9|#09090b)["']/i
    );
  });

  it("removes fixed light structural classes from catalog surfaces", () => {
    expect(catalogSurfaceSources.join("\n")).not.toMatch(
      /(?:bg-\[#fafafa\]|bg-white|text-\[#09090b\]|text-black|border-(?:slate|gray)-[12]00(?:\/70)?)/
    );
  });
});
