export type Platform = "meta" | "tiktok" | "shopify";

export interface PlatformMetricRecord {
  platform: Platform;
  accountId: string;
  campaignId?: string;
  creativeId?: string;
  collectedAt: string;
  externalId: string;
  metrics: Record<string, number>;
  raw?: unknown;
}

export interface PlatformMetricsClient {
  readonly platform: Platform;
  fetchMetrics(input: { accountId: string; campaignId?: string; since?: string; until?: string }): Promise<PlatformMetricRecord[]>;
}

export interface PlatformMetricsRegistry {
  register(client: PlatformMetricsClient): void;
  get(platform: Platform): PlatformMetricsClient | undefined;
  all(): PlatformMetricsClient[];
}

export class DefaultPlatformMetricsRegistry implements PlatformMetricsRegistry {
  private readonly clients = new Map<Platform, PlatformMetricsClient>();
  register(client: PlatformMetricsClient): void { this.clients.set(client.platform, client); }
  get(platform: Platform): PlatformMetricsClient | undefined { return this.clients.get(platform); }
  all(): PlatformMetricsClient[] { return [...this.clients.values()]; }
}

export interface MetricIngestionResult {
  platform: Platform;
  records: PlatformMetricRecord[];
  collectedAt: string;
}

export class PlatformMetricsIngestionService {
  constructor(private readonly registry: PlatformMetricsRegistry) {}

  async ingest(input: { platform: Platform; accountId: string; campaignId?: string; since?: string; until?: string }): Promise<MetricIngestionResult> {
    const client = this.registry.get(input.platform);
    if (!client) throw new Error(`No metrics client registered for ${input.platform}`);
    const records = await client.fetchMetrics(input);
    return { platform: input.platform, records, collectedAt: new Date().toISOString() };
  }
}
