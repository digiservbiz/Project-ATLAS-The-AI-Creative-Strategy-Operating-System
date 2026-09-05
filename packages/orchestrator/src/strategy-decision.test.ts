import { describe, expect, it } from "vitest";
import { StrategyDecisionBuilder } from "./strategy-decision";

describe("StrategyDecisionBuilder", () => {
  it("records historical evidence and confidence", () => {
    const result = new StrategyDecisionBuilder().build(
      { organizationId: "org-1", projectId: "project-1", objective: "increase purchases", inputs: {}, memory: {} },
      {
        request: { organizationId: "org-1", projectId: "project-1", objective: "increase purchases" },
        historicalEvidence: [
          {
            key: "performance:meta:c1",
            score: 0.9,
            object: {
              id: "performance:meta:c1",
              organizationId: "org-1",
              projectId: "project-1",
              objectType: "campaign",
              sourceId: "campaign-1",
              content: "Historical campaign",
              metadata: {},
            },
            provenance: { source: "test" },
          },
        ],
      },
    );

    expect(result.evidence[0]?.key).toBe("performance:meta:c1");
    expect(result.evidence[0]?.score).toBe(0.9);
    expect(result.confidence).toBeGreaterThan(0.5);
  });
});
