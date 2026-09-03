import { describe, expect, it, vi } from "vitest";
import type { IntelligenceSnapshot } from "@atlas/intelligence";
import { MetaIntelligenceSync } from "./meta-intelligence-sync";
import type { MetaPerformanceSync } from "./meta-performance-sync";
import type { PerformanceIntelligenceIngestion } from "./performance-intelligence-ingestion";

const snapshot = {
  business: { business: { id: "business-1" } },
  state: { businessId: "business-1" },
  nextBestActions: [],
} as unknown as IntelligenceSnapshot;

const request = {
  accessToken: "secret",
  adAccountId: "123",
  dateStart: "2026-09-01",
  dateStop: "2026-09-02",
};

const context = { businessId: "business-1" };

const input = {
  creativeId: "creative-1",
  businessId: "business-1",
  platform: "meta_ads",
  period: { start: "2026-09-01", end: "2026-09-02" },
};

describe("MetaIntelligenceSync", () => {
  it("passes collected Meta inputs through ingestion and advances the snapshot", async () => {
    const performanceSync = {
      collect: vi.fn(async () => ({ rows: [{ ad_id: "creative-1", date_start: "2026-09-01", date_stop: "2026-09-02" }], inputs: [input] })),
    } as unknown as MetaPerformanceSync;
    const firstSnapshot = { ...snapshot, state: { ...snapshot.state, revision: 2 } } as IntelligenceSnapshot;
    const ingestion = {
      process: vi.fn(async () => ({ performance: {} as never, creative: {} as never, learning: null, snapshot: firstSnapshot })),
    } as unknown as PerformanceIntelligenceIngestion;

    const result = await new MetaIntelligenceSync(performanceSync, ingestion).sync(request, context, snapshot);

    expect(performanceSync.collect).toHaveBeenCalledWith(request, context);
    expect(ingestion.process).toHaveBeenCalledWith(input, snapshot);
    expect(result.rows).toHaveLength(1);
    expect(result.inputs).toEqual([input]);
    expect(result.snapshot).toBe(firstSnapshot);
    expect(result.learnings).toEqual([]);
  });

  it("processes multiple creatives against the latest snapshot", async () => {
    const secondInput = { ...input, creativeId: "creative-2" };
    const performanceSync = {
      collect: vi.fn(async () => ({ rows: [], inputs: [input, secondInput] })),
    } as unknown as MetaPerformanceSync;
    const snapshots = [
      { ...snapshot, state: { ...snapshot.state, revision: 1 } } as IntelligenceSnapshot,
      { ...snapshot, state: { ...snapshot.state, revision: 2 } } as IntelligenceSnapshot,
    ];
    const ingestion = {
      process: vi.fn()
        .mockResolvedValueOnce({ performance: {} as never, creative: {} as never, learning: null, snapshot: snapshots[0] })
        .mockResolvedValueOnce({ performance: {} as never, creative: {} as never, learning: null, snapshot: snapshots[1] }),
    } as unknown as PerformanceIntelligenceIngestion;

    const result = await new MetaIntelligenceSync(performanceSync, ingestion).sync(request, context, snapshot);

    expect(ingestion.process).toHaveBeenNthCalledWith(1, input, snapshot);
    expect(ingestion.process).toHaveBeenNthCalledWith(2, secondInput, snapshots[0]);
    expect(result.snapshot).toBe(snapshots[1]);
  });

  it("collects only learning records produced by ingestion", async () => {
    const learning = { id: "learning-1", businessId: "business-1" };
    const performanceSync = {
      collect: vi.fn(async () => ({ rows: [], inputs: [input] })),
    } as unknown as MetaPerformanceSync;
    const ingestion = {
      process: vi.fn(async () => ({ performance: {} as never, creative: {} as never, learning, snapshot })),
    } as unknown as PerformanceIntelligenceIngestion;

    const result = await new MetaIntelligenceSync(performanceSync, ingestion).sync(request, context, snapshot);

    expect(result.learnings).toEqual([learning]);
  });

  it("rejects a cross-business sync before calling Meta", async () => {
    const collect = vi.fn();
    const performanceSync = { collect } as unknown as MetaPerformanceSync;
    const ingestion = {} as PerformanceIntelligenceIngestion;

    await expect(new MetaIntelligenceSync(performanceSync, ingestion).sync(request, { businessId: "business-2" }, snapshot))
      .rejects.toThrow("business scope mismatch");
    expect(collect).not.toHaveBeenCalled();
  });

  it("propagates provider failures without exposing the access token", async () => {
    const performanceSync = {
      collect: vi.fn(async () => { throw new Error("Meta Insights request failed"); }),
    } as unknown as MetaPerformanceSync;
    const ingestion = {} as PerformanceIntelligenceIngestion;

    await expect(new MetaIntelligenceSync(performanceSync, ingestion).sync(request, context, snapshot))
      .rejects.toThrow("Meta Insights request failed");
  });
});
