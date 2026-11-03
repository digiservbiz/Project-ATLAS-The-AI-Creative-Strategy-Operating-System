import { describe, expect, it } from "vitest";
import type { AudienceIntelligence } from "./audience-intelligence.js";
import type { CreativeHypothesis } from "./creative-hypothesis-engine.js";
import type { DecisionRecord } from "./decision-record.js";
import { PersistentIntelligenceService } from "./persistent-intelligence-service.js";
import type { IntelligenceEntityType, IntelligenceRepository, PersistenceEnvelope } from "./persistence-contract.js";

class MemoryRepository implements IntelligenceRepository {
  private readonly records = new Map<string, PersistenceEnvelope>();

  async get<T>(businessId: string, entityType: IntelligenceEntityType, id: string): Promise<PersistenceEnvelope<T> | null> {
    const record = this.records.get(`${businessId}:${entityType}:${id}`);
    return (record as PersistenceEnvelope<T> | undefined) ?? null;
  }

  async put<T>(record: PersistenceEnvelope<T>): Promise<void> {
    this.records.set(`${record.businessId}:${record.entityType}:${record.id}`, record);
  }

  async list<T>(businessId: string, entityType: IntelligenceEntityType): Promise<PersistenceEnvelope<T>[]> {
    return [...this.records.values()].filter((record) => record.businessId === businessId && record.entityType === entityType) as PersistenceEnvelope<T>[];
  }
}

const base = {
  evidenceIds: ["e-1"],
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("PersistentIntelligenceService", () => {
  it("persists decisions, hypotheses and audiences with versioning", async () => {
    const repository = new MemoryRepository();
    const service = new PersistentIntelligenceService({ repository });

    const decision: DecisionRecord = {
      ...base,
      id: "decision-1",
      businessId: "business-1",
      kind: "strategic",
      decision: "Prioritize the highest-intent audience",
      rationale: "Strong evidence",
      confidence: 0.9,
      status: "approved",
    };
    const hypothesis: CreativeHypothesis = {
      ...base,
      id: "hypothesis-1",
      businessId: "business-1",
      statement: "A stronger proof hook will improve conversion",
      reasoning: ["Recent evidence supports proof-led messaging"],
      variable: "hook",
      variants: ["proof", "generic"],
      successMetrics: ["conversion_rate"],
      expectedOutcome: "higher conversion",
      status: "proposed",
      confidence: 0.8,
    };
    const audience: AudienceIntelligence = {
      ...base,
      id: "audience-1",
      businessId: "business-1",
      name: "High intent buyers",
      problems: ["slow decisions"],
      desires: ["confidence"],
      fears: [],
      frustrations: [],
      objections: [],
      previousSolutions: [],
      failureReasons: [],
      buyingTriggers: ["proof"],
      emotionalMotivations: [],
      customerLanguage: ["show me proof"],
      awarenessLevel: "solution-aware",
      purchaseIntent: "high",
      jobsToBeDone: ["choose safely"],
      desiredTransformation: "confident purchase",
      confidence: 0.85,
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    const d1 = await service.recordDecision(decision);
    const h1 = await service.recordHypothesis(hypothesis);
    const a1 = await service.recordAudience(audience);

    expect(d1.version).toBe(1);
    expect(h1.version).toBe(1);
    expect(a1.version).toBe(1);

    const d2 = await service.recordDecision({ ...decision, status: "superseded" });
    expect(d2.version).toBe(2);
    expect((await repository.get<DecisionRecord>("business-1", "decision", "decision-1"))?.data.status).toBe("superseded");
  });
});
