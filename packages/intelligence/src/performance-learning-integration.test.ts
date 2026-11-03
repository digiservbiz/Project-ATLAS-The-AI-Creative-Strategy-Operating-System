import { describe, expect, it } from "vitest";
import { createStrategicState } from "./strategic-state.js";
import { PersistentIntelligenceService } from "./persistent-intelligence-service.js";
import type { IntelligenceEntityType, IntelligenceRepository, PersistenceEnvelope } from "./persistence-contract.js";
import type { CreativeDNA } from "./creative-dna.js";

class MemoryRepository implements IntelligenceRepository {
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
  business: { id: "business-1", name: "ATLAS Demo", model: "ecommerce" as const, markets: ["BE"], channels: ["meta"], brandIds: ["brand-1"] },
  brands: [{ id: "brand-1", businessId: "business-1", name: "Demo", positioning: "Useful products" }],
  offers: [], audiences: [], competitors: [], campaigns: [],
};

const dna: CreativeDNA = {
  id: "creative-1",
  businessId: "business-1",
  hook: "Stop wasting time",
  angle: "time-saving",
  format: "video",
  platform: "meta",
  archetype: "problem_solution",
  evidenceIds: ["creative-evidence-1"],
  confidence: 0.8,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const strongPerformance = {
  creativeId: "creative-1",
  businessId: "business-1",
  platform: "meta",
  period: { start: "2026-10-01T00:00:00.000Z", end: "2026-10-07T23:59:59.000Z" },
  impressions: 12000,
  clicks: 480,
  spend: 120,
  conversions: 24,
  revenue: 600,
  evidenceIds: ["meta-insights:ad-1:2026-10-01"],
};

describe("performance → Creative DNA → Learning integration", () => {
  it("normalizes platform metrics, persists Creative DNA and feeds supported learning into Strategic State", async () => {
    const repository = new MemoryRepository();
    const service = new PersistentIntelligenceService({ repository });
    const state = createStrategicState(model);
    state.activeHypotheses = [{
      id: "creative-performance:creative-1",
      statement: "The current hook and angle convert efficiently",
      evidenceIds: [],
      confidence: 0.5,
      status: "testing",
    }];

    const result = await service.ingestPerformanceOutcome(state, dna, strongPerformance);

    expect(result.performance.ctr).toBeCloseTo(0.04);
    expect(result.performance.cpc).toBeCloseTo(0.25);
    expect(result.performance.cpa).toBeCloseTo(5);
    expect(result.performance.roas).toBeCloseTo(5);
    expect(result.creative.performance?.roas).toBeCloseTo(5);
    expect(result.creative.evidenceIds).toContain("meta-insights:ad-1:2026-10-01");
    expect(result.learning?.status).toBe("supported");
    expect(result.state.knownLearnings.some((item) => item.includes("supports its current hook/angle"))).toBe(true);
    expect(result.state.activeHypotheses[0]?.status).toBe("supported");

    const savedDna = await repository.get<CreativeDNA>("business-1", "creative_dna", "creative-1");
    const savedLearning = await repository.get("business-1", "learning", result.learning!.id);
    const savedState = await repository.get("business-1", "strategic_state", "strategic-state:business-1");
    expect(savedDna?.data.performance?.roas).toBeCloseTo(5);
    expect(savedLearning?.data).toEqual(result.learning);
    expect(savedState?.data).toEqual(result.state);
  });

  it("persists performance but withholds learning when the sample is insufficient", async () => {
    const repository = new MemoryRepository();
    const service = new PersistentIntelligenceService({ repository });
    const state = createStrategicState(model);

    const result = await service.ingestPerformanceOutcome(state, dna, {
      ...strongPerformance,
      impressions: 20,
      clicks: 1,
      conversions: 0,
    });

    expect(result.learning).toBeNull();
    expect(result.state).toEqual(state);
    expect((await repository.get<CreativeDNA>("business-1", "creative_dna", "creative-1"))?.data.performance).toBeDefined();
    expect((await repository.list("business-1", "learning"))).toHaveLength(0);
  });

  it("rejects cross-business performance before writing any record", async () => {
    const repository = new MemoryRepository();
    const service = new PersistentIntelligenceService({ repository });
    const state = createStrategicState(model);

    await expect(service.ingestPerformanceOutcome(state, dna, {
      ...strongPerformance,
      businessId: "another-business",
    })).rejects.toThrow("Performance outcome belongs to a different business");

    expect(await repository.list("business-1", "creative_dna")).toHaveLength(0);
  });

  it("rejects invalid reporting periods", async () => {
    const repository = new MemoryRepository();
    const service = new PersistentIntelligenceService({ repository });
    const state = createStrategicState(model);

    await expect(service.ingestPerformanceOutcome(state, dna, {
      ...strongPerformance,
      period: { start: "2026-10-08T00:00:00.000Z", end: "2026-10-01T00:00:00.000Z" },
    })).rejects.toThrow("Performance period must contain a valid start and end");
  });
});
