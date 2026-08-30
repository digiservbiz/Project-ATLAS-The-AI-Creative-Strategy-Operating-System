import { describe, expect, it } from "vitest";
import { createBusinessIntelligenceModel } from "./business-intelligence-model";
import { createStrategicState } from "./strategic-state";
import { buildIntelligenceSnapshot, ingestLearning } from "./intelligence-hub";
import { createLearningFromOutcome } from "./learning-loop";
import { selectNextWorkflow } from "./orchestrator-intelligence-adapter";

describe("ATLAS intelligence integration", () => {
  const model = createBusinessIntelligenceModel({
    business: { id: "b1", name: "Demo", model: "saas", markets: ["BE"], channels: ["meta"], brandIds: ["brand-1"] },
    brands: [{ id: "brand-1", businessId: "b1", name: "Demo Brand", positioning: "Simple automation" }],
    offers: [], audiences: [], competitors: [], campaigns: [],
  });

  it("builds an intelligence snapshot and selects a workflow", () => {
    const state = createStrategicState(model, "Acquire customers");
    const snapshot = buildIntelligenceSnapshot(model, state, { offerWeakness: true });
    expect(snapshot.nextBestActions.length).toBeGreaterThan(0);
    expect(selectNextWorkflow({ snapshot, signals: { offerWeakness: true } }).workflow).toBe("offer_optimization");
  });

  it("rejects learning from another business", () => {
    const state = createStrategicState(model);
    const snapshot = buildIntelligenceSnapshot(model, state);
    const learning = createLearningFromOutcome({ experimentId: "e1", hypothesisId: "h1", variable: "hook", sampleSize: 100, confidence: .9, result: "supported", evidenceIds: [], businessId: "other-business", period: { start: "2026-01-01", end: "2026-01-02" } });
    expect(() => ingestLearning(snapshot, learning)).toThrow("Learning belongs to a different business");
  });
});
