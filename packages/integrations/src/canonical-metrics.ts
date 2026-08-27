export interface CanonicalMetrics {
  platform: "meta" | "tiktok" | "shopify";
  externalId: string;
  campaignId?: string;
  creativeId?: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  collectedAt: string;
}

export function normalizeMetrics(input: { platform: CanonicalMetrics["platform"]; externalId: string; campaignId?: string; creativeId?: string; impressions?: number; clicks?: number; spend?: number; conversions?: number; revenue?: number; collectedAt?: string }): CanonicalMetrics {
  const impressions = Math.max(0, Number(input.impressions ?? 0));
  const clicks = Math.max(0, Number(input.clicks ?? 0));
  const spend = Math.max(0, Number(input.spend ?? 0));
  const conversions = Math.max(0, Number(input.conversions ?? 0));
  const revenue = Math.max(0, Number(input.revenue ?? 0));
  return {
    platform: input.platform,
    externalId: input.externalId,
    campaignId: input.campaignId,
    creativeId: input.creativeId,
    impressions,
    clicks,
    spend,
    conversions,
    revenue,
    ctr: impressions ? clicks / impressions : 0,
    cpc: clicks ? spend / clicks : 0,
    cpa: conversions ? spend / conversions : 0,
    roas: spend ? revenue / spend : 0,
    collectedAt: input.collectedAt ?? new Date().toISOString(),
  };
}
