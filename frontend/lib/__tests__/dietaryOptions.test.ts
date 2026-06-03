import { DIETARY_OPTIONS } from "@/lib/dietaryOptions";

describe("dietary options", () => {
  it("provides a distinct SVG icon for every supported dietary category", () => {
    expect(DIETARY_OPTIONS).toHaveLength(6);

    for (const option of DIETARY_OPTIONS) {
      expect(option.icon).toBeDefined();
    }

    expect(new Set(DIETARY_OPTIONS.map((option) => option.icon)).size).toBe(
      DIETARY_OPTIONS.length
    );
  });

  it("does not describe dietary tags as guaranteed suitable", () => {
    for (const option of DIETARY_OPTIONS) {
      expect(option.description).not.toMatch(/apto para/i);
    }
  });
});
