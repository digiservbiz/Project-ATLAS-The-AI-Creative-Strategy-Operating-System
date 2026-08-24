export interface CreativeMetrics {
  impressions?: number;
  reach?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  conversions?: number;
  cpa?: number;
  roas?: number;
  revenue?: number;
  engagement?: number;
}

export interface MetricsSnapshot {
  id: string;
  campaignId: string;
  creativeId?: string;
  source: string;
  collectedAt: string;
  metrics: CreativeMetrics;
}

export interface MetricsStore {
  save(snapshot: MetricsSnapshot): Promise<void>;
  list(campaignId: string): Promise<MetricsSnapshot[]>;
}

export class InMemoryMetricsStore implements MetricsStore {
  private readonly snapshots: MetricsSnapshot[] = [];

  async save(snapshot: MetricsSnapshot): Promise<void> {
    this.snapshots.push(snapshot);
  }

  async list(campaignId: string): Promise<MetricsSnapshot[]> {
    return this.snapshots.filter((item) => item.campaignId === campaignId);
  }
}

export function calculateDerivedMetrics(metrics: CreativeMetrics): CreativeMetrics {
  const derived = { ...metrics };
  if (metrics.impressions && metrics.clicks !== undefined) derived.ctr = metrics.clicks / metrics.impressions;
  if (metrics.impressions && metrics.revenue !== undefined) derived.cpm = (metrics.revenue / metrics.impressions) * 1000;
  if (metrics.conversions && metrics.revenue !== undefined) derived.cpa = metrics.revenue / metrics.conversions;
  return derived;
}
