import type { CreativeMetrics, MetricsSnapshot } from "@atlas/analytics";

export interface PlatformMetricRecord { id: string; campaignId?: string; creativeId?: string; source: "meta" | "tiktok" | "shopify"; collectedAt: string; metrics: Record<string, unknown>; }

export function toCanonicalMetric(record: PlatformMetricRecord): MetricsSnapshot {
  const m = record.metrics;
  const num = (key: string) => typeof m[key] === "number" ? m[key] as number : undefined;
  const metrics: CreativeMetrics = {
    impressions: num("impressions"), reach: num("reach"), clicks: num("clicks"), conversions: num("conversions"),
    revenue: num("revenue"), engagement: num("engagement"), ctr: num("ctr"), cpc: num("cpc"), cpm: num("cpm"), cpa: num("cpa"), roas: num("roas"),
  };
  return { id: record.id, campaignId: record.campaignId ?? "unattributed", creativeId: record.creativeId, source: record.source, collectedAt: record.collectedAt, metrics };
}
