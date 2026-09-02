import { describe, expect, it, vi } from "vitest";
import type { CreativeDNA, IntelligenceSnapshot, PersistentIntelligenceService } from "@atlas/intelligence";
import { PerformanceIntelligenceIngestion } from "./performance-intelligence-ingestion";

const dna: CreativeDNA = {
  id: "creative-1",
  businessId: "business-1",
  concept: "Outcome-led creative",
  hook: "Stop wasting time",
  angle: "efficiency",
  promise: "Save time",
  format: "video",
  platform: "meta",
  audienceId: "audience-1",
  offerId: "offer-1",
  evidenceIds: [],
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

describe("PerformanceIntelligenceIngestion", () => {
  it("persists Creative DNA and feeds strong performance into learning", async () => {
    const recordCreativeDNA = vi.fn(async () => undefined);
    const ingestLearning = vi.fn(async (_snapshot: IntelligenceSnapshot, learning: unknown) => ({
      ...snapshot,
      state: { ...snapshot.state, knownLearnings: [learning] },
    }));
    const service = { recordCreativeDNA, ingestLearning } as unknown as PersistentIntelligenceService;
    const ingestion = new PerformanceIntelligenceIngestion({ get: async () => dna }, service);

    const result = await ingestion.process(input, snapshot);

    expect(result.performance.roas).toBe(4);
    expect(result.performance.ctr).toBe(0.06);
    expect(result.learning?.status).toBe("supported");
    expect(recordCreativeDNA).toHaveBeenCalledWith(expect.objectContaining({ id: dna.id, performance: expect.any(Object) }));
    expect(ingestLearning).toHaveBeenCalledTimes(1);
    expect(result.snapshot.state.knownLearnings).toHaveLength(1);
  });

  it("updates Creative DNA but does not learn from insufficient data", async () => {
    const recordCreativeDNA = vi.fn(async () => undefined);
    const ingestLearning = vi.fn(async () => snapshot);
    const ingestion = new PerformanceIntelligenceIngestion({ get: async () => dna }, {
      recordCreativeDNA,
      ingestLearning,
    } as unknown as PersistentIntelligenceService);

    const result = await ingestion.process({ ...input, impressions: 20, clicks: 2, conversions: 0 }, snapshot);

    expect(result.learning).toBeNull();
    expect(recordCreativeDNA).toHaveBeenCalledTimes(1);
    expect(ingestLearning).not.toHaveBeenCalled();
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
