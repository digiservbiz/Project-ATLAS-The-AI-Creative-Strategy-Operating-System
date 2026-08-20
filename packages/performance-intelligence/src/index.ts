import type { CampaignMetricSnapshot, CampaignPerformanceRecord, DerivedMetrics, PerformanceInsight } from "./contracts";

export * from "./contracts";

export function deriveMetrics(snapshot: CampaignMetricSnapshot): DerivedMetrics {
  const impressions = snapshot.impressions ?? 0;
  const clicks = snapshot.clicks ?? 0;
  const spend = snapshot.spend ?? 0;
  const conversions = snapshot.conversions ?? 0;
  const revenue = snapshot.revenue ?? 0;
  return {
    ctr: impressions > 0 ? clicks / impressions : undefined,
    cpc: clicks > 0 ? spend / clicks : undefined,
    cpm: impressions > 0 ? (spend / impressions) * 1000 : undefined,
    cpa: conversions > 0 ? spend / conversions : undefined,
    roas: spend > 0 ? revenue / spend : undefined,
  };
}

export function normalizeSnapshot(snapshot: CampaignMetricSnapshot): CampaignPerformanceRecord {
  return { ...snapshot, derived: deriveMetrics(snapshot) };
}

export function analyzePerformance(record: CampaignPerformanceRecord): PerformanceInsight {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 0.5;

  if ((record.derived.ctr ?? 0) >= 0.02) {
    score += 0.15;
    findings.push("CTR is at or above the 2% baseline.");
  } else if (record.impressions && record.impressions > 0) {
    score -= 0.1;
    findings.push("CTR is below the 2% baseline.");
    recommendations.push("Review creative hook, offer and audience alignment.");
  }
  if ((record.derived.roas ?? 0) >= 2) {
    score += 0.2;
    findings.push("ROAS is at or above 2x.");
  } else if (record.spend && record.spend > 0) {
    score -= 0.15;
    findings.push("ROAS is below 2x or unavailable.");
    recommendations.push("Investigate conversion rate, CPA and creative fatigue before increasing spend.");
  }

  const direction = score > 0.6 ? "positive" : score < 0.45 ? "negative" : "neutral";
  return { campaignId: record.campaignId, score: Math.max(0, Math.min(1, score)), direction, findings, recommendations };
}
