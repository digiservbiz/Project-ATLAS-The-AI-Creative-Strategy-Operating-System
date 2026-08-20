import { describe, expect, it } from "vitest";
import { analyzePerformance, deriveMetrics } from "./index";
import type { CampaignMetricSnapshot } from "./contracts";

const snapshot: CampaignMetricSnapshot = {
  organizationId: "org-1",
  platform: "meta",
  campaignId: "campaign-1",
  timestamp: "2026-08-20T00:00:00Z",
  impressions: 10000,
  clicks: 300,
  spend: 100,
  conversions: 10,
  revenue: 300,
};

describe("performance intelligence", () => {
  it("derives standard advertising metrics", () => {
    const metrics = deriveMetrics(snapshot);
    expect(metrics.ctr).toBeCloseTo(0.03);
    expect(metrics.cpc).toBeCloseTo(100 / 300);
    expect(metrics.cpm).toBe(10);
    expect(metrics.cpa).toBe(10);
    expect(metrics.roas).toBe(3);
  });

  it("produces a positive insight for strong performance", () => {
    const insight = analyzePerformance({ ...snapshot, derived: deriveMetrics(snapshot) });
    expect(insight.direction).toBe("positive");
    expect(insight.recommendations).toHaveLength(0);
  });
});
