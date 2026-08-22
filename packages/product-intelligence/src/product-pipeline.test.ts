import { describe, expect, it } from "vitest";
import { ProductIntelligencePipeline } from "./product-pipeline";

describe("ProductIntelligencePipeline", () => {
  it("produces a strategy-ready profile from multiple inputs", async () => {
    const pipeline = new ProductIntelligencePipeline({
      async extract(source) {
        if (source.type === "url") return { sourceId: source.id, name: "ATLAS Bottle", description: "Insulated bottle", features: ["insulated"], benefits: ["keeps drinks cold"] };
        if (source.type === "image") return { sourceId: source.id, creativeAngles: ["lifestyle"], audienceSignals: ["commuters"] };
        return { sourceId: source.id, objections: ["price"], features: ["leakproof"] };
      },
    });
    const result = await pipeline.run([
      { type: "url", url: "https://example.com/product" },
      { type: "image", assetUrl: "https://cdn/product.jpg" },
      { type: "document", assetUrl: "https://cdn/spec.pdf", mimeType: "application/pdf" },
    ]);
    expect(result.readyForStrategy).toBe(true);
    expect(result.profile.features).toEqual(["insulated", "leakproof"]);
    expect(result.profile.creativeAngles).toEqual(["lifestyle"]);
    expect(result.profile.audienceSignals).toEqual(["commuters"]);
  });
});
