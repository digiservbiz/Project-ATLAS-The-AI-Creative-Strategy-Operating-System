import type { PlatformPerformanceInput } from "@atlas/intelligence";

export interface MetaActionValue {
  action_type: string;
  value?: string | number;
}

/** Minimal Meta Ads Insights shape required by ATLAS. */
export interface MetaAdsInsightsRow {
  ad_id?: string;
  creative_id?: string;
  date_start: string;
  date_stop: string;
  impressions?: string | number;
  clicks?: string | number;
  spend?: string | number;
  actions?: MetaActionValue[];
  action_values?: MetaActionValue[];
}

export interface MetaPerformanceAdapterContext {
  businessId: string;
  /** Optional mapping when the ATLAS creative ID differs from the Meta ad/creative ID. */
  creativeId?: string;
  /** Optional extra evidence IDs to preserve provider provenance. */
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

function sumActionValues(actions: MetaActionValue[] | undefined, types: Set<string>): number {
  return (actions ?? []).reduce((total, action) => {
    if (!types.has(action.action_type)) return total;
    return total + (numberValue(action.value) ?? 0);
  }, 0);
}

function resolveConversions(row: MetaAdsInsightsRow): number {
  return sumActionValues(row.actions, new Set([
    "purchase",
    "omni_purchase",
    "lead",
    "complete_registration",
  ]));
}

function resolveRevenue(row: MetaAdsInsightsRow): number {
  return sumActionValues(row.action_values, new Set([
    "purchase",
    "omni_purchase",
  ]));
}

function evidenceId(row: MetaAdsInsightsRow, creativeId: string): string {
  return `meta-performance:${creativeId}:${row.date_start}:${row.date_stop}`;
}

/**
 * Maps one Meta Ads Insights row into ATLAS's provider-neutral performance contract.
 * This adapter performs no network calls and never accepts or stores access tokens.
 */
export function mapMetaAdsInsights(
  row: MetaAdsInsightsRow,
  context: MetaPerformanceAdapterContext,
): PlatformPerformanceInput {
  if (!context.businessId.trim()) throw new Error("Business ID is required");
  const creativeId = context.creativeId?.trim() || row.creative_id?.trim() || row.ad_id?.trim();
  if (!creativeId) throw new Error("Meta creative ID is required");
  if (!row.date_start || !row.date_stop) throw new Error("Meta performance period is required");

  const providerEvidenceId = evidenceId(row, creativeId);
  return {
    creativeId,
    businessId: context.businessId,
    platform: "meta_ads",
    period: { start: row.date_start, end: row.date_stop },
    impressions: numberValue(row.impressions),
    clicks: numberValue(row.clicks),
    spend: numberValue(row.spend),
    conversions: resolveConversions(row),
    revenue: resolveRevenue(row),
    evidenceIds: [...new Set([providerEvidenceId, ...(context.evidenceIds ?? [])])],
  };
}

export function mapMetaAdsInsightsBatch(
  rows: MetaAdsInsightsRow[],
  context: MetaPerformanceAdapterContext,
): PlatformPerformanceInput[] {
  return rows.map((row) => mapMetaAdsInsights(row, context));
}
