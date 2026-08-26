import type { PlatformMetricRecord } from "./platform-metrics";

export interface AttributionMapping { platform: string; externalId: string; campaignId: string; creativeId?: string; confidence: number; }
export interface AttributionStore { find(platform: string, externalId: string): Promise<AttributionMapping | null>; save(mapping: AttributionMapping): Promise<void>; }

export class InMemoryAttributionStore implements AttributionStore {
  private readonly map = new Map<string, AttributionMapping>();
  private key(platform: string, id: string) { return `${platform}:${id}`; }
  async find(platform: string, externalId: string) { return this.map.get(this.key(platform, externalId)) ?? null; }
  async save(mapping: AttributionMapping) { this.map.set(this.key(mapping.platform, mapping.externalId), mapping); }
}

export class DefaultAttributionResolver {
  constructor(private readonly store: AttributionStore) {}
  async resolve(record: PlatformMetricRecord): Promise<{ campaignId: string; creativeId?: string }> {
    const mapping = await this.store.find(record.platform, record.externalId);
    if (!mapping || mapping.confidence < 0.8) throw new Error(`No high-confidence attribution for ${record.platform}:${record.externalId}`);
    return { campaignId: mapping.campaignId, creativeId: mapping.creativeId };
  }
}
