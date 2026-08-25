import type { CreativeMetrics, MetricsSnapshot, MetricsStore } from "@atlas/analytics";

export interface RawPlatformMetric {
  id: string;
  campaignId: string;
  creativeId?: string;
  source: string;
  collectedAt: string;
  values: Record<string, unknown>;
}

export interface PlatformMetricMapper {
  source: string;
  map(raw: RawPlatformMetric): CreativeMetrics;
}

export class CanonicalMetricsIngestion {
  constructor(private readonly store: MetricsStore, private readonly mappers: PlatformMetricMapper[]) {}

  async ingest(raw: RawPlatformMetric): Promise<MetricsSnapshot> {
    const mapper = this.mappers.find((item) => item.source === raw.source);
    if (!mapper) throw new Error(`No canonical metrics mapper registered for ${raw.source}`);
    const metrics = mapper.map(raw);
    const snapshot: MetricsSnapshot = {
      id: raw.id,
      campaignId: raw.campaignId,
      creativeId: raw.creativeId,
      source: raw.source,
      collectedAt: raw.collectedAt,
      metrics,
    };
    await this.store.save(snapshot);
    return snapshot;
  }
}
