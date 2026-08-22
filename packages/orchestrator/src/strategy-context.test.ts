import { describe, expect, it } from "vitest";
import { StrategyContextBuilder } from "./strategy-context";

describe("StrategyContextBuilder", () => {
  it("retrieves organization-scoped historical evidence before strategy", async () => {
    let request: Record<string, unknown> | undefined;
    const builder = new StrategyContextBuilder({
      async search(input) { request = input; return [{ key: "performance:meta:c1", score: 0.94, value: { roas: 4.2 }, tags: ["performance"] }]; },
    });
    const result = await builder.build({ organizationId: "org-1" } as never, { platform: "meta", objective: "increase purchases", audience: "pet owners", product: "premium cat food" });
    expect(result.historicalEvidence[0].score).toBe(0.94);
    expect(request).toEqual({ query: "increase purchases | pet owners | premium cat food", organizationId: "org-1", platform: "meta", limit: 5 });
  });
});
