import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const purchaseFiles = [
  "(tabs)/cart.tsx",
  "checkout-v2.tsx",
  "payments.tsx",
  "payment/_layout.tsx",
  "payment/success.tsx",
  "payment/failure.tsx",
  "payment/pending.tsx",
  "../components/CartItem.tsx",
  "../components/PaymentMethodSelector.tsx",
  "../components/StepIndicator.tsx",
] as const;

const sources = purchaseFiles.map((file) => ({
  file,
  source: readFileSync(resolve(__dirname, "..", file), "utf8"),
}));

const legacyColorClass =
  /\b(?:bg|text|border)-(?:white|gray-\d+|slate-\d+(?:\/\d+)?|zinc-\d+|red-\d+|emerald-\d+|amber-\d+|orange-\d+)\b/;
const fixedColorLiteral = /#[0-9a-f]{3,8}\b|rgba?\(/i;

describe("purchase flow dark theme migration", () => {
  it.each(sources)("$file removes fixed light color classes", ({ source }) => {
    expect(source).not.toMatch(legacyColorClass);
  });

  it.each(sources)("$file removes fixed color literals", ({ source }) => {
    expect(source).not.toMatch(fixedColorLiteral);
  });

  it.each([
    "checkout-v2.tsx",
    "payments.tsx",
    "payment/_layout.tsx",
    "payment/success.tsx",
    "payment/failure.tsx",
    "payment/pending.tsx",
    "../components/CartItem.tsx",
    "../components/PaymentMethodSelector.tsx",
    "../components/StepIndicator.tsx",
  ])("$file consumes useAppTheme for inline colors", (file) => {
    const source = readFileSync(resolve(__dirname, "..", file), "utf8");

    expect(source).toContain('from "@/hooks/useAppTheme"');
    expect(source).toContain("palette");
  });

  it.each(["checkout-v2.tsx", "payments.tsx", "payment/_layout.tsx"])(
    "$file renders responsive StatusBar style",
    (file) => {
      const source = readFileSync(resolve(__dirname, "..", file), "utf8");

      expect(source).toContain("<StatusBar style={statusBarStyle} />");
    }
  );
});
