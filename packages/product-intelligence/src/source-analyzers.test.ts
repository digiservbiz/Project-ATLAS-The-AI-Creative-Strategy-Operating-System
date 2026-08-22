import { describe, expect, it } from "vitest";
import { SourceFactExtractor } from "./source-analyzers";

describe("SourceFactExtractor", () => {
  it("dispatches each source type to its analyzer", async () => {
    const extractor = new SourceFactExtractor(
      { fetch: async () => ({ text: "Bottle keeps drinks cold", metadata: { name: "Atlas Bottle", price: 29, currency: "USD" } }) },
      { analyze: async () => ({ description: "Insulated bottle", visibleText: ["24h cold"], productSignals: ["insulated"] }) },
      { extract: async () => ({ text: "Leakproof stainless steel", metadata: { features: ["leakproof"] } }) },
    );
    const url = await extractor.extract({ id: "u", type: "url", locator: "https://example.com" });
    const image = await extractor.extract({ id: "i", type: "image", locator: "https://cdn/image.jpg" });
    const doc = await extractor.extract({ id: "d", type: "document", locator: "https://cdn/spec.pdf", metadata: { mimeType: "application/pdf" } });
    expect(url.name).toBe("Atlas Bottle");
    expect(image.features).toEqual(["insulated"]);
    expect(doc.features).toEqual(["leakproof"]);
  });
});
