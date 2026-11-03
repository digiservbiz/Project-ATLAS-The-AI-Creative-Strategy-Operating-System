import { describe, expect, it } from "vitest";
import { addDecision, addEvidence, addHypothesis } from "./evidence-decision-pipeline.js";
import { createCreativeHypothesis } from "./creative-hypothesis-engine.js";
import { createExperiment, recordExperimentResult } from "./creative-experimentation.js";
import { createStrategicState } from "./strategic-state.js";
import { createCreativeDNA } from "./creative-dna.js";
import { PersistentIntelligenceService } from "./persistent-intelligence-service.js";
import type { IntelligenceEntityType, IntelligenceRepository, PersistenceEnvelope } from "./persistence-contract.js";

class JourneyRepository implements IntelligenceRepository {
  private readonly records = new Map<string, PersistenceEnvelope>();

  async get<T>(businessId: string, entityType: IntelligenceEntityType, id: string): Promise<PersistenceEnvelope<T> | null> {
    return (this.records.get(`${businessId}:${entityType}:${id}`) as PersistenceEnvelope<T> | undefined) ?? null;
  }

  async put<T>(record: PersistenceEnvelope<T>): Promise<void> {
    this.records.set(`${record.businessId}:${record.entityType}:${record.id}`, record);
  }

  async list<T>(businessId: string, entityType: IntelligenceEntityType): Promise<PersistenceEnvelope<T>[]> {
    return [...this.records.values()].filter((r) => r.businessId === businessId && r.entityType === entityType) as PersistenceEnvelope<T>[];
  }
}

const model = {
  business: { id: "journey-business", name: "Journey Demo", model: "ecommerce" as const, markets: ["BE"], channels: ["meta"], brandIds: ["journey-brand"] },
  brands: [{ id: "journey-brand", businessId: "journey-business", name: "Journey", positioning: "Simple and effective" }],
  offers: [], audiences: [], competitors: [], campaigns: [],
};

describe("ATLAS research → strategy → execution → performance → learning journey", () => {
  it("carries evidence through a hypothesis and experiment into persisted performance learning", async () => {
    const repository = new JourneyRepository();
    const persistence = new PersistentIntelligenceService({ repository });
    let state = createStrategicState(model, "Improve purchase conversion");

    // Research: retain a source-backed observation as strategic evidence.
    state = addEvidence(state, {
      id: "review-evidence-1",
      type: "observed_evidence",
      statement: "Customers need proof that setup is quick.",
      sourceIds: ["review:customer-17"],
      confidence: 0.92,
      createdAt: "2026-10-01T00:00:00.000Z",
    });

    // Strategy: create a falsifiable hypothesis and record the decision to test it.
    const hypothesis = createCreativeHypothesis({
      id: "creative-performance:journey-creative",
      businessId: "journey-business",
      statement: "A proof-led hook will outperform a generic benefit hook.",
      reasoning: ["Customer reviews repeatedly ask for setup proof."],
      evidenceIds: ["review-evidence-1"],
      variable: "hook",
      control: "Save time with our product",
      variants: ["See setup completed in 60 seconds", "Save time with our product"],
      successMetrics: ["conversion_rate"],
      expectedOutcome: "Higher purchase conversion.",
      status: "testing",
      confidence: 0.75,
      createdAt: "2026-10-01T00:00:00.000Z",
    });
    state = addHypothesis(state, {
      id: hypothesis.id,
      statement: hypothesis.statement,
      evidenceIds: hypothesis.evidenceIds,
      confidence: hypothesis.confidence,
      status: "testing",
    });
    state = addDecision(state, {
      id: "decision-test-proof-hook",
      statement: "Run a controlled proof-hook creative test.",
      evidenceIds: ["review-evidence-1"],
      hypothesisIds: [hypothesis.id],
      confidence: 0.8,
      approved: true,
      createdAt: "2026-10-01T00:00:00.000Z",
    });

    // Execution: create the experiment, persist its plan and record a variant result.
    let experiment = createExperiment(hypothesis, "experiment-proof-hook");
    experiment = recordExperimentResult(experiment, {
      variantId: "experiment-proof-hook:v1",
      sampleSize: 12000,
      successMetric: "conversion_rate",
      value: 0.02,
      period: { start: "2026-10-01T00:00:00.000Z", end: "2026-10-07T23:59:59.000Z" },
    });
    await persistence.recordHypothesis(hypothesis);
    await persistence.recordExperiment(experiment, "journey-business", ["review-evidence-1"]);

    const creative = createCreativeDNA({
      id: "journey-creative",
      businessId: "journey-business",
      hypothesisId: hypothesis.id,
      experimentId: experiment.id,
      hook: "See setup completed in 60 seconds",
      angle: "proof-led speed",
      proof: "Customer-demonstrated setup",
      format: "short_video",
      platform: "meta",
      archetype: "demonstration",
      evidenceIds: ["review-evidence-1"],
      confidence: 0.8,
      createdAt: "2026-10-01T00:00:00.000Z",
    });

    // Performance: normalize platform metrics, update DNA, and feed qualifying learning back.
    const outcome = await persistence.ingestPerformanceOutcome(state, creative, {
      creativeId: "journey-creative",
      businessId: "journey-business",
      platform: "meta",
      period: { start: "2026-10-01T00:00:00.000Z", end: "2026-10-07T23:59:59.000Z" },
      impressions: 12000,
      clicks: 480,
      spend: 120,
      conversions: 24,
      revenue: 600,
      evidenceIds: ["meta-insights:creative-1:2026-10-01"],
    });

    expect(outcome.performance.roas).toBe(5);
    expect(outcome.creative.performance?.ctr).toBe(0.04);
    expect(outcome.learning?.status).toBe("supported");
    expect(outcome.state.knownLearnings.length).toBe(1);
    expect(outcome.state.activeHypotheses[0]?.status).toBe("supported");

    // Durable state: every stage is retrievable through the same business-scoped repository.
    expect((await repository.get("journey-business", "hypothesis", hypothesis.id))?.data).toEqual(hypothesis);
    expect((await repository.get("journey-business", "experiment", experiment.id))?.data).toEqual(experiment);
    expect((await repository.get("journey-business", "creative_dna", creative.id))?.data).toEqual(outcome.creative);
    expect((await repository.get("journey-business", "learning", outcome.learning!.id))?.data).toEqual(outcome.learning);
    expect((await repository.get("journey-business", "strategic_state", "strategic-state:journey-business"))?.data).toEqual(outcome.state);
  });
});
