import { describe, expect, it } from "vitest";
import { ProductInputAggregator } from "./product-input";

describe("ProductInputAggregator", () => {
  it("combines URL, image and document sources into one profile", async () => {
    const aggregator = new ProductInputAggregator({
      async resolve(input) { return { id: input.type, type: input.type, locator: input.type === "url" ? input.url : input.assetUrl }; },
    });
    const profile = await aggregator.aggregate([
      { type: "url", url: "https://example.com/product" },
      { type: "image", assetUrl: "https://cdn/product.jpg", filename: "product.jpg" },
      { type: "document", assetUrl: "https://cdn/spec.pdf", filename: "spec.pdf", mimeType: "application/pdf" },
    ]);
    expect(profile.sources.map((source) => source.type)).toEqual(["url", "image", "document"]);
  });

  it("rejects an empty product submission", async () => {
    const aggregator = new ProductInputAggregator({ resolve: async () => ({ id: "x", type: "url", locator: "x" }) });
    await expect(aggregator.aggregate([])).rejects.toThrow("At least one product input");
  });
});
