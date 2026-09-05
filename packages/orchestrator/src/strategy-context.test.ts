import { describe, expect, it } from "vitest";
import { StrategyContextBuilder } from "./strategy-context";

const semanticResult = {
  results: [
    {
      object: {
        id: "performance:meta:c1",
        organizationId: "org-1",
        projectId: "project-1",
        objectType: "campaign",
        sourceId: "campaign-1",
        content: "Meta campaign performance",
        metadata: { roas: 4.2 },
      },
      similarity: 0.94,
      rank: 1,
      provenance: { source: "test" },
    },
  ],
  embeddingModel: "test-embedding",
};

describe("StrategyContextBuilder", () => {
  it("retrieves organization/project-scoped historical evidence before strategy", async () => {
    let request: Record<string, unknown> | undefined;
    const builder = new StrategyContextBuilder({
      async search(input) {
        request = input;
        return semanticResult;
      },
    } as never);

    const result = await builder.build(
      { organizationId: "org-1", projectId: "project-1" } as never,
      { platform: "meta", objective: "increase purchases", audience: "pet owners", product: "premium cat food" },
    );

    expect(result.historicalEvidence[0]?.score).toBe(0.94);
    expect(result.historicalEvidence[0]?.key).toBe("performance:meta:c1");
    expect(request).toEqual({
      query: "increase purchases | pet owners | premium cat food",
      organizationId: "org-1",
      projectId: "project-1",
      topK: 5,
      objectTypes: [],
      filters: { platform: "meta" },
    });
  });
});
