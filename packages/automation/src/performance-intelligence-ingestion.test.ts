import { describe, expect, it, vi } from "vitest";
import type { CreativeDNA, PersistentIntelligenceService } from "@atlas/intelligence";
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
  it("persists Creative DNA and creates learning for a strong outcome", async () => {
    const put = vi.fn(async () => undefined);
    const recordLearning = vi.fn(async () => undefined);
    const service = { recordLearning } as unknown as PersistentIntelligenceService;
    const ingestion = new PerformanceIntelligenceIngestion({
      get: async () => dna,
      put,
    }, service);

    const result = await ingestion.process(input);

    expect(result.performance.roas).toBe(4);
    expect(result.performance.ctr).toBe(0.06);
    expect(result.learning?.status).toBe("supported");
    expect(put).toHaveBeenCalledWith(expect.objectContaining({ id: dna.id, performance: expect.any(Object) }));
    expect(recordLearning).toHaveBeenCalledTimes(1);
  });

  it("does not learn from insufficient data", async () => {
    const recordLearning = vi.fn(async () => undefined);
    const ingestion = new PerformanceIntelligenceIngestion({
      get: async () => dna,
      put: async () => undefined,
    }, { recordLearning } as unknown as PersistentIntelligenceService);

    const result = await ingestion.process({ ...input, impressions: 20, clicks: 2, conversions: 0 });
    expect(result.learning).toBeNull();
    expect(recordLearning).not.toHaveBeenCalled();
  });

  it("rejects cross-business Creative DNA", async () => {
    const ingestion = new PerformanceIntelligenceIngestion({
      get: async () => ({ ...dna, businessId: "business-2" }),
      put: async () => undefined,
    }, { recordLearning: async () => undefined } as unknown as PersistentIntelligenceService);

    await expect(ingestion.process(input)).rejects.toThrow("business scope mismatch");
  });
});
