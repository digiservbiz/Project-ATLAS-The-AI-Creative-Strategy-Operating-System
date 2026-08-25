import type { MetricsSnapshot } from "@atlas/analytics";

export interface PurchaseEvent { id: string; campaignId?: string; creativeId?: string; value: number; currency: string; occurredAt: string; }
export interface AttributionResult { campaignId: string; creativeId?: string; revenue: number; conversions: number; currency: string; confidence: number; purchaseIds: string[]; }

export function attributePurchases(purchases: PurchaseEvent[], fallbackCampaignId = "unattributed"): AttributionResult[] {
  const grouped = new Map<string, AttributionResult>();
  for (const purchase of purchases) {
    const campaignId = purchase.campaignId ?? fallbackCampaignId;
    const key = `${campaignId}:${purchase.creativeId ?? "none"}:${purchase.currency}`;
    const current = grouped.get(key) ?? { campaignId, creativeId: purchase.creativeId, revenue: 0, conversions: 0, currency: purchase.currency, confidence: purchase.campaignId ? 0.9 : 0.35, purchaseIds: [] };
    current.revenue += purchase.value;
    current.conversions += 1;
    current.purchaseIds.push(purchase.id);
    grouped.set(key, current);
  }
  return [...grouped.values()];
}

export function mergeAttribution(metrics: MetricsSnapshot, attribution: AttributionResult): MetricsSnapshot {
  return {
    ...metrics,
    campaignId: attribution.campaignId,
    creativeId: attribution.creativeId ?? metrics.creativeId,
    metrics: {
      ...metrics.metrics,
      revenue: attribution.revenue,
      conversions: attribution.conversions,
      cpa: attribution.conversions ? undefined : metrics.metrics.cpa,
    },
  };
}
