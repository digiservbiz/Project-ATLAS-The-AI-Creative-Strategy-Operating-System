import { describe, expect, it, vi } from "vitest";
import type { CreativeDNA, IntelligenceSnapshot, PersistentIntelligenceService } from "@atlas/intelligence";
import { PerformanceIntelligenceIngestion } from "./performance-intelligence-ingestion.js";

const dna: CreativeDNA = {
  id: "creative-1",
  businessId: "business-1",
  hypothesisId: "hypothesis-1",
  hook: "Stop wasting time",
  angle: "efficiency",
  promise: "Save time",
  format: "video",
  platform: "meta",
  archetype: "problem_solution",
  audienceId: "audience-1",
  evidenceIds: [],
  confidence: 0.8,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const snapshot = {
  business: { business: { id: "business-1" } },
  state: { businessId: "business-1" },
  nextBestActions: [],
} as unknown as IntelligenceSnapshot;

const input = {
  creativeId: "creative-1",
  businessId: "business-1",
  platform: "meta",
  period: { start: "2026-09-01", end: "2026-09-02" },
  impressions: 1000,
  clicks: 60,
  spend: 100,
  conversions: 10,
  revenue: 400,
  evidenceIds: ["meta:report:1"],
};

function serviceMock(learning: unknown) {
  const ingestPerformanceSnapshot = vi.fn(async () => ({
    state: snapshot.state,
    performance: {
      creativeId: "creative-1",
      businessId: "business-1",
      platform: "meta",
      period: input.period,
      impressions: 1000,
      clicks: 60,
      spend: 100,
      conversions: 10,
      revenue: 400,
      ctr: 0.06,
      cpc: 100 / 60,
      cpa: 10,
      roas: 4,
      evidenceIds: ["meta:report:1"],
    },
    creative: { ...dna, performance: { impressions: 1000, clicks: 60, spend: 100, conversions: 10, revenue: 400, ctr: 0.06, cpc: 100 / 60, cpa: 10, roas: 4 } },
    learning,
    snapshot: learning ? { ...snapshot, state: { ...snapshot.state, knownLearnings: [learning] } } : snapshot,
  }));
  return { service: { ingestPerformanceSnapshot } as unknown as PersistentIntelligenceService, ingestPerformanceSnapshot };
}

describe("PerformanceIntelligenceIngestion", () => {
  it("delegates attribution and learning to the durable intelligence service", async () => {
    const learning = { id: "learning:performance:creative-1", status: "supported" };
    const { service, ingestPerformanceSnapshot } = serviceMock(learning);
    const ingestion = new PerformanceIntelligenceIngestion({ get: async () => dna }, service);

    const result = await ingestion.process(input, snapshot);

    expect(result.performance.roas).toBe(4);
    expect(result.performance.ctr).toBe(0.06);
    expect(result.learning?.status).toBe("supported");
    expect(ingestPerformanceSnapshot).toHaveBeenCalledWith(snapshot, dna, input, {});
    expect(result.snapshot.state.knownLearnings).toHaveLength(1);
  });

  it("updates no learning when the durable service reports insufficient data", async () => {
    const { service, ingestPerformanceSnapshot } = serviceMock(null);
    const ingestion = new PerformanceIntelligenceIngestion({ get: async () => dna }, service);

    const result = await ingestion.process({ ...input, impressions: 20, clicks: 2, conversions: 0 }, snapshot);

    expect(result.learning).toBeNull();
    expect(ingestPerformanceSnapshot).toHaveBeenCalledTimes(1);
    expect(result.snapshot).toBe(snapshot);
  });

  it("rejects performance from another business before reading Creative DNA", async () => {
    const get = vi.fn(async () => dna);
    const ingestion = new PerformanceIntelligenceIngestion({ get }, {} as PersistentIntelligenceService);

    await expect(ingestion.process({ ...input, businessId: "business-2" }, snapshot))
      .rejects.toThrow("different business");
    expect(get).not.toHaveBeenCalled();
  });

  it("rejects cross-business Creative DNA", async () => {
    const ingestion = new PerformanceIntelligenceIngestion({
      get: async () => ({ ...dna, businessId: "business-2" }),
    }, {} as PersistentIntelligenceService);

    await expect(ingestion.process(input, snapshot)).rejects.toThrow("business scope mismatch");
  });
});
