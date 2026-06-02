import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const screens = [
  "wishlist.tsx",
  "recently-viewed.tsx",
  "orders.tsx",
  "orders/[id].tsx",
  "addresses.tsx",
  "messages.tsx",
  "support.tsx",
] as const;

const components = [
  "components/WishlistTableRow.tsx",
  "components/OrderListItem.tsx",
  "components/OrderItemRow.tsx",
] as const;

function readAppSource(path: string) {
  return readFileSync(resolve(__dirname, "..", path), "utf8");
}

function readFrontendSource(path: string) {
  return readFileSync(resolve(__dirname, "../..", path), "utf8");
}

describe("secondary flows dark theme migration", () => {
  it.each(screens)("%s resolves palette and responsive StatusBar", (path) => {
    const source = readAppSource(path);

    expect(source).toContain('from "@/hooks/useAppTheme"');
    expect(source).toContain("useAppTheme()");
    expect(source).toContain("<StatusBar style={statusBarStyle} />");
    expect(source).not.toContain('<StatusBar style="dark" />');
    expect(source).not.toContain("bg-[#fafafa]");
    expect(source).toContain("palette.colors.surface.warm");
  });

  it.each(components)("%s uses inline theme palette", (path) => {
    const source = readFrontendSource(path);

    expect(source).toContain('from "@/hooks/useAppTheme"');
    expect(source).toContain("useAppTheme()");
    expect(source).toContain("palette.colors.surface");
    expect(source).toContain("palette.colors.ink");
    expect(source).toContain("palette.colors.border");
    expect(source).toContain("palette.colors.icon");
  });

  it("keeps wishlist stock badges semantic and theme-aware", () => {
    const source = readFrontendSource("components/WishlistTableRow.tsx");

    expect(source).toContain("palette.colors.state.error");
    expect(source).toContain("palette.colors.state.success");
  });

  it("keeps order and address feedback semantic and theme-aware", () => {
    const orderSources = [
      readAppSource("orders.tsx"),
      readAppSource("orders/[id].tsx"),
    ].join("\n");
    const addressSource = readAppSource("addresses.tsx");

    expect(orderSources).toContain("palette.colors.state.error");
    expect(orderSources).toContain("palette.colors.state.success");
    expect(addressSource).toContain("palette.colors.state.error");
    expect(addressSource).toContain("palette.colors.state.success");
  });
});
