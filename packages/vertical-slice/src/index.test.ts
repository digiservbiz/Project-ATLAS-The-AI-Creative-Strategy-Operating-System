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

  it("catches low strategy confidence", () => {
    const result = runDeterministicScenario(deterministicScenarioInput, { strategyConfidence: 0.59 });
    expect(result.status).toBe("failed");
    expect(result.failures).toContainEqual(expect.objectContaining({ stage: "strategy", code: "LOW_STRATEGY_CONFIDENCE" }));
  });

  it("catches semantic retrieval mismatch", () => {
    const result = runDeterministicScenario(deterministicScenarioInput, { semanticMatches: ["unrelated:low similarity"] });
    expect(result.status).toBe("failed");
    expect(result.failures).toContainEqual(expect.objectContaining({ stage: "intelligence-decision", code: "SEMANTIC_RETRIEVAL_MISMATCH" }));
  });

  it("catches low intelligence confidence", () => {
    const result = runDeterministicScenario(deterministicScenarioInput, { intelligenceConfidence: 0.59 });
    expect(result.status).toBe("failed");
    expect(result.failures).toContainEqual(expect.objectContaining({ stage: "intelligence-decision", code: "LOW_DECISION_CONFIDENCE" }));
  });

  it("blocks a non-proceed intelligence decision from execution", () => {
    const result = runDeterministicScenario(deterministicScenarioInput, { intelligenceDecision: "reject" });
    expect(result.status).toBe("failed");
    expect(result.failures).toContainEqual(expect.objectContaining({ stage: "intelligence-decision", code: "DECISION_BLOCKED" }));
    expect(result.failures).toContainEqual(expect.objectContaining({ stage: "orchestrator", code: "BLOCKED_DECISION_EXECUTED" }));
  });

  it("catches an approval-boundary bypass", () => {
    const result = runDeterministicScenario(deterministicScenarioInput, { approvalRequired: false });
    expect(result.status).toBe("failed");
    expect(result.failures).toContainEqual(expect.objectContaining({ stage: "orchestrator", code: "APPROVAL_BOUNDARY_BYPASSED" }));
  });

  it("catches invalid execution budget", () => {
    const result = runDeterministicScenario(deterministicScenarioInput, { budgetCents: 0 });
    expect(result.status).toBe("failed");
    expect(result.failures).toContainEqual(expect.objectContaining({ stage: "execution", code: "INVALID_BUDGET" }));
  });

  it("catches impossible performance metrics", () => {
    const result = runDeterministicScenario(deterministicScenarioInput, { impressions: 100, clicks: 101 });
    expect(result.status).toBe("failed");
    expect(result.failures).toContainEqual(expect.objectContaining({ stage: "performance", code: "IMPOSSIBLE_CLICK_VOLUME" }));
  });

  it("does not allow learning to claim support without evidence", () => {
    const result = runDeterministicScenario(deterministicScenarioInput, { conversions: 0, learningConfidence: 0.59 });
    expect(result.status).toBe("failed");
    expect(result.failures).toContainEqual(expect.objectContaining({ stage: "learning", code: "INSUFFICIENT_LEARNING_EVIDENCE" }));
  });

  it("catches a broken learning-to-next-action transition", () => {
    const result = runDeterministicScenario(deterministicScenarioInput, { suppressNextActions: true });
    expect(result.status).toBe("failed");
    expect(result.failures).toContainEqual(expect.objectContaining({ stage: "next-action", code: "NO_NEXT_ACTION" }));
  });
});
