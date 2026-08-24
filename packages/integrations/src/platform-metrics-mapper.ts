import type { MetricsSnapshot } from "@atlas/analytics";
import type { PlatformMetricRecord } from "./platform-metrics";

export interface AttributionResolver {
  resolve(record: PlatformMetricRecord): Promise<{ campaignId: string; creativeId?: string }>;
}

export interface CanonicalMetricsMapper {
  map(record: PlatformMetricRecord, attribution: { campaignId: string; creativeId?: string }): MetricsSnapshot;
}

export class DefaultCanonicalMetricsMapper implements CanonicalMetricsMapper {
  map(record: PlatformMetricRecord, attribution: { campaignId: string; creativeId?: string }): MetricsSnapshot {
    const m = record.metrics;
    return {
      id: `metric:${record.platform}:${record.externalId}:${record.collectedAt}`,
      campaignId: attribution.campaignId,
      creativeId: attribution.creativeId,
      source: record.platform,
      collectedAt: record.collectedAt,
      metrics: {
        impressions: m.impressions,
        reach: m.reach,
        clicks: m.clicks,
        ctr: m.ctr,
        cpc: m.cpc,
        cpm: m.cpm,
        conversions: m.conversions,
        cpa: m.cpa,
        roas: m.roas,
        revenue: m.revenue,
        engagement: m.engagement,
      },
    };
  }
}

export class PlatformMetricsToCanonicalService {
  constructor(private readonly attribution: AttributionResolver, private readonly mapper: CanonicalMetricsMapper) {}

  async map(records: PlatformMetricRecord[]): Promise<MetricsSnapshot[]> {
    return Promise.all(records.map(async (record) => this.mapper.map(record, await this.attribution.resolve(record))));
  }
}
