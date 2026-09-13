import { describe, expect, it } from "vitest";
import { deterministicScenarioInput, runDeterministicScenario } from "./index";

describe("ATLAS deterministic vertical slice", () => {
  it("runs the full product-to-next-action loop", () => {
    const result = runDeterministicScenario(deterministicScenarioInput);

    expect(result.stages).toEqual([
      "product",
      "strategy",
      "intelligence-decision",
      "orchestrator",
      "execution",
      "performance",
      "learning",
      "next-action",
    ]);
    expect(result.intelligence.decision).toBe("proceed");
    expect(result.learning.status).toBe("supported");
    expect(result.nextActions.length).toBeGreaterThan(0);
    expect(result.nextActions.some((action) => action.type === "replace_fatigued_creative")).toBe(true);
    expect(result.nextActions.some((action) => action.requiredApproval)).toBe(true);
    expect(result.status).toBe("needs_review");
    expect(result.failures).toEqual([]);
  });

  it("fails deterministically when the product contract is incomplete", () => {
    const result = runDeterministicScenario({
      ...deterministicScenarioInput,
      customerProblem: "",
    });

    expect(result.status).toBe("failed");
    expect(result.failures).toContainEqual(expect.objectContaining({
      stage: "product",
      code: "PRODUCT_INCOMPLETE",
      severity: "error",
    }));
  });
});
