import type { PlatformPerformanceInput } from "@atlas/intelligence";

export interface TikTokActionValue {
  action_type: string;
  value?: string | number;
}

/** Minimal TikTok Ads reporting shape required by ATLAS. */
export interface TikTokAdsInsightsRow {
  ad_id?: string;
  adgroup_id?: string;
  campaign_id?: string;
  creative_id?: string;
  stat_time_day: string;
  impressions?: string | number;
  clicks?: string | number;
  spend?: string | number;
  conversions?: string | number;
  conversion_value?: string | number;
  actions?: TikTokActionValue[];
  action_values?: TikTokActionValue[];
}

export interface TikTokPerformanceAdapterContext {
  businessId: string;
  creativeId?: string;
  evidenceIds?: string[];
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function actionTotal(actions: TikTokActionValue[] | undefined, types: Set<string>): number {
  return (actions ?? []).reduce((total, action) => {
    if (!types.has(action.action_type)) return total;
    return total + (numberValue(action.value) ?? 0);
  }, 0);
}

function resolveConversions(row: TikTokAdsInsightsRow): number {
  const direct = numberValue(row.conversions);
  if (direct !== undefined) return direct;
  return actionTotal(row.actions, new Set(["purchase", "complete_payment", "conversion", "lead"]));
}

function resolveRevenue(row: TikTokAdsInsightsRow): number {
  const direct = numberValue(row.conversion_value);
  if (direct !== undefined) return direct;
  return actionTotal(row.action_values, new Set(["purchase", "complete_payment", "conversion"]));
}

/** Maps a TikTok reporting row into ATLAS's provider-neutral performance contract. */
export function mapTikTokAdsInsights(
  row: TikTokAdsInsightsRow,
  context: TikTokPerformanceAdapterContext,
): PlatformPerformanceInput {
  if (!context.businessId.trim()) throw new Error("Business ID is required");
  const creativeId = context.creativeId?.trim() || row.creative_id?.trim() || row.ad_id?.trim();
  if (!creativeId) throw new Error("TikTok creative ID is required");
  if (!row.stat_time_day) throw new Error("TikTok performance period is required");

  const evidenceId = `tiktok-performance:${creativeId}:${row.stat_time_day}`;
  return {
    creativeId,
    businessId: context.businessId,
    platform: "tiktok_ads",
    period: { start: row.stat_time_day, end: row.stat_time_day },
    impressions: numberValue(row.impressions),
    clicks: numberValue(row.clicks),
    spend: numberValue(row.spend),
    conversions: resolveConversions(row),
    revenue: resolveRevenue(row),
    evidenceIds: [...new Set([evidenceId, ...(context.evidenceIds ?? [])])],
  };
}

export function mapTikTokAdsInsightsBatch(
  rows: TikTokAdsInsightsRow[],
  context: TikTokPerformanceAdapterContext,
): PlatformPerformanceInput[] {
  return rows.map((row) => mapTikTokAdsInsights(row, context));
}
