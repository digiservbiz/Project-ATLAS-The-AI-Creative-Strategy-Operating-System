import { describe, expect, it } from "vitest";
import { mapMetaAdsInsights, mapMetaAdsInsightsBatch } from "./meta-performance-adapter";

describe("mapMetaAdsInsights", () => {
  it("maps Meta Insights metrics and purchase value into the canonical contract", () => {
    const result = mapMetaAdsInsights({
      ad_id: "ad-123",
      creative_id: "creative-123",
      date_start: "2026-09-01",
      date_stop: "2026-09-01",
      impressions: "1000",
      clicks: "45",
      spend: "50.25",
      actions: [
        { action_type: "link_click", value: "40" },
        { action_type: "purchase", value: "3" },
      ],
      action_values: [
        { action_type: "purchase", value: "210.50" },
      ],
    }, { businessId: "business-1" });

    expect(result).toEqual({
      creativeId: "creative-123",
      businessId: "business-1",
      platform: "meta_ads",
      period: { start: "2026-09-01", end: "2026-09-01" },
      impressions: 1000,
      clicks: 45,
      spend: 50.25,
      conversions: 3,
      revenue: 210.5,
      evidenceIds: ["meta-performance:creative-123:2026-09-01:2026-09-01"],
    });
  });

  it("uses an explicit ATLAS creative mapping before provider IDs", () => {
    const result = mapMetaAdsInsights({
      ad_id: "ad-1",
      creative_id: "meta-creative-1",
      date_start: "2026-09-01",
      date_stop: "2026-09-02",
    }, {
      businessId: "business-1",
      creativeId: "atlas-creative-1",
      evidenceIds: ["source:meta:account-1"],
    });

    expect(result.creativeId).toBe("atlas-creative-1");
    expect(result.evidenceIds).toEqual([
      "meta-performance:atlas-creative-1:2026-09-01:2026-09-02",
      "source:meta:account-1",
    ]);
  });

  it("supports rows without creative_id by falling back to ad_id", () => {
    const result = mapMetaAdsInsights({
      ad_id: "ad-9",
      date_start: "2026-09-01",
      date_stop: "2026-09-07",
    }, { businessId: "business-1" });

    expect(result.creativeId).toBe("ad-9");
  });

  it("rejects rows without a usable creative identifier", () => {
    expect(() => mapMetaAdsInsights({
      date_start: "2026-09-01",
      date_stop: "2026-09-01",
    }, { businessId: "business-1" })).toThrow("Meta creative ID is required");
  });

  it("maps batches without sharing mutable evidence arrays", () => {
    const result = mapMetaAdsInsightsBatch([
      { ad_id: "ad-1", date_start: "2026-09-01", date_stop: "2026-09-01" },
      { ad_id: "ad-2", date_start: "2026-09-01", date_stop: "2026-09-01" },
    ], { businessId: "business-1", evidenceIds: ["meta:account-1"] });

    expect(result).toHaveLength(2);
    expect(result[0].evidenceIds).not.toBe(result[1].evidenceIds);
    expect(result[0].evidenceIds).toContain("meta:account-1");
  });
});
