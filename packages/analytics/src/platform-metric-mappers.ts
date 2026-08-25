import type { CreativeMetrics } from "@atlas/analytics";
import type { PlatformMetricMapper, RawPlatformMetric } from "./canonical-metrics-ingestion";

const n = (value: unknown): number | undefined => typeof value === "number" && Number.isFinite(value) ? value : undefined;

function mapCommon(raw: RawPlatformMetric): CreativeMetrics {
  const v = raw.values;
  return {
    impressions: n(v.impressions ?? v.views),
    reach: n(v.reach),
    clicks: n(v.clicks ?? v.link_clicks),
    ctr: n(v.ctr),
    cpc: n(v.cpc),
    cpm: n(v.cpm),
    conversions: n(v.conversions ?? v.purchases),
    cpa: n(v.cpa ?? v.cost_per_purchase),
    roas: n(v.roas ?? v.purchase_roas),
    revenue: n(v.revenue ?? v.purchase_value),
    engagement: n(v.engagement ?? v.engagements),
  };
}

export class MetaMetricsMapper implements PlatformMetricMapper {
  readonly source = "meta";
  map(raw: RawPlatformMetric): CreativeMetrics { return mapCommon(raw); }
}

export class TikTokMetricsMapper implements PlatformMetricMapper {
  readonly source = "tiktok";
  map(raw: RawPlatformMetric): CreativeMetrics { return mapCommon(raw); }
}

export class ShopifyMetricsMapper implements PlatformMetricMapper {
  readonly source = "shopify";
  map(raw: RawPlatformMetric): CreativeMetrics { return mapCommon(raw); }
}
