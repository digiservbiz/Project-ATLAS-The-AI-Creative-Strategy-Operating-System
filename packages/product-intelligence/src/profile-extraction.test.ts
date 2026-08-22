import { describe, expect, it } from "vitest";
import { ProductProfileExtractor } from "./profile-extraction";

describe("ProductProfileExtractor", () => {
  it("merges facts and flags conflicting prices", async () => {
    const extractor = new ProductProfileExtractor({
      async extract(source) {
        if (source.id === "url") return { sourceId: source.id, name: "Atlas Bottle", price: 29, currency: "USD", features: ["insulated"], benefits: ["cold drinks"] };
        return { sourceId: source.id, name: "Atlas Bottle", price: 25, currency: "USD", features: ["leakproof"], audienceSignals: ["commuters"] };
      },
    });
    const profile = await extractor.build([{ id: "url", type: "url", locator: "https://example.com" }, { id: "pdf", type: "document", locator: "spec.pdf" }]);
    expect(profile.features).toEqual(["insulated", "leakproof"]);
    expect(profile.audienceSignals).toEqual(["commuters"]);
    expect(profile.conflicts[0].field).toBe("price");
  });
});
