import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sharedComponentPaths = [
  "components/ui/ScreenHeader.tsx",
  "components/AuthGate.tsx",
  "components/ui/ListEmptyState.tsx",
  "components/HomeSkeleton.tsx",
  "components/ProductCardSkeleton.tsx",
  "components/WishlistSkeletonRow.tsx",
  "components/ui/NavBar/BottomNavBar.tsx",
  "components/ErrorBoundary.tsx",
  "components/CartFlyOverlay.tsx",
  "components/ui/toast/index.tsx",
  "app/(tabs)/_layout.tsx",
] as const;

const structuralColorPatterns = [
  /bg-\[#fafafa\]/,
  /bg-white/,
  /bg-black/,
  /bg-gray-100/,
  /active:bg-gray-200/,
  /bg-slate-100/,
  /bg-slate-200/,
  /border-slate-200/,
  /text-black/,
  /text-zinc-500/,
  /text-zinc-600/,
  /"#000"/,
  /"#fafafa"/,
  /"#ffffff"/,
  /"#f1f5f9"/,
  /"#6b7280"/,
  /"#09090b"/,
  /"#111827"/,
  /"#303030"/,
  /"#cbd5e1"/,
  /"#e2e8f0"/,
  /"rgba\(226,232,240,0\.7\)"/,
  /backgroundColor: "white"/,
  /color="white"/,
] as const;

describe("shared dark theme migration", () => {
  it.each(sharedComponentPaths)(
    "does not keep structural light-only colors in %s",
    (componentPath) => {
      const source = readFileSync(
        resolve(__dirname, "../../", componentPath),
        "utf8"
      );

      structuralColorPatterns.forEach((pattern) => {
        expect(source).not.toMatch(pattern);
      });
    }
  );
});
