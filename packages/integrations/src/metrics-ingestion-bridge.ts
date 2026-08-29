import type { Platform, ProviderRequest, ProviderTransport } from "./provider-transports";

export interface CanonicalMetric { id: string; platform: Platform; externalId: string; campaignId?: string; creativeId?: string; collectedAt: string; metrics: Record<string, number>; raw: unknown; }
export interface MetricsSink { save(metric: CanonicalMetric): Promise<void>; }

export class MetricsIngestionBridge {
  constructor(private readonly transports: Partial<Record<Platform, ProviderTransport>>, private readonly sink: MetricsSink) {}
  async ingest(platform: Platform, request: ProviderRequest, externalIdField = "id") {
    const transport = this.transports[platform];
    if (!transport) throw new Error(`No transport configured for ${platform}`);
    const response = await transport.request<Record<string, unknown>>(request);
    const data = response.data;
    const externalId = String(data[externalIdField] ?? "");
    if (!externalId) throw new Error(`Provider response missing ${externalIdField}`);
    const metrics: Record<string, number> = {};
    for (const [key, value] of Object.entries(data)) if (typeof value === "number") metrics[key] = value;
    const canonical: CanonicalMetric = { id: `${platform}:${externalId}:${Date.now()}`, platform, externalId, collectedAt: new Date().toISOString(), metrics, raw: data };
    await this.sink.save(canonical);
    return canonical;
  }
}
