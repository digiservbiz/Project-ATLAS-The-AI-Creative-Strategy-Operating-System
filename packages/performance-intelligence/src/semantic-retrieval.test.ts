import { describe, expect, it } from "vitest";
import { PerformanceSemanticRetriever } from "./semantic-retrieval";

describe("PerformanceSemanticRetriever", () => {
  it("scopes retrieval to the organization and applies a default limit", async () => {
    let request: Record<string, unknown> | undefined;
    const retriever = new PerformanceSemanticRetriever({
      async search(input) { request = input; return [{ key: "k1", score: 0.91, value: { campaignId: "c1" } }]; },
    });
    const hits = await retriever.findSimilar({ organizationId: "org-1" } as never, { query: "high ROAS ecommerce creative", platform: "meta" });
    expect(hits[0].score).toBe(0.91);
    expect(request).toEqual({ query: "high ROAS ecommerce creative", platform: "meta", organizationId: "org-1", limit: 5 });
  });
});
