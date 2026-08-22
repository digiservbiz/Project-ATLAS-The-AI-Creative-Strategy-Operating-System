import { describe, expect, it } from "vitest";
import { StrategyDecisionBuilder } from "./strategy-decision";

describe("StrategyDecisionBuilder", () => {
  it("records historical evidence and confidence", () => {
    const result = new StrategyDecisionBuilder().build({ organizationId: "org-1" } as never, {
      request: { organizationId: "org-1", objective: "increase purchases" },
      historicalEvidence: [{ key: "performance:meta:c1", score: 0.9, value: {}, tags: ["performance"] }],
    });
    expect(result.evidence[0].key).toBe("performance:meta:c1");
    expect(result.confidence).toBeGreaterThan(0.5);
  });
});
