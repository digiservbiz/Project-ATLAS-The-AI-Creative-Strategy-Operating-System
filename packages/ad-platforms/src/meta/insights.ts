import type { CampaignMetricSnapshot } from "@atlas/performance-intelligence";

export interface MetaInsightPayload {
  campaign_id: string;
  ad_id?: string;
  date_start?: string;
  date_stop?: string;
  impressions?: string | number;
  clicks?: string | number;
  spend?: string | number;
  conversions?: string | number;
  action_values?: Array<{ action_type?: string; value?: string | number }>;
  [key: string]: unknown;
}

function number(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function conversionCount(payload: MetaInsightPayload): number | undefined {
  const direct = number(payload.conversions);
  if (direct !== undefined) return direct;
  return undefined;
}

function revenue(payload: MetaInsightPayload): number | undefined {
  const values = payload.action_values ?? [];
  const purchase = values.find((item) => item.action_type === "purchase" || item.action_type === "omni_purchase");
  return number(purchase?.value);
}

export function mapMetaInsight(payload: MetaInsightPayload, organizationId: string, timestamp?: string): CampaignMetricSnapshot {
  return {
    organizationId,
    platform: "meta",
    campaignId: payload.campaign_id,
    adId: payload.ad_id,
    timestamp: timestamp ?? payload.date_stop ?? new Date().toISOString(),
    impressions: number(payload.impressions),
    clicks: number(payload.clicks),
    spend: number(payload.spend),
    conversions: conversionCount(payload),
    revenue: revenue(payload),
  };
}
