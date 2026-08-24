import type { Platform, PlatformMetricRecord, PlatformMetricsClient } from "./platform-metrics";

export interface HttpClient {
  request<T>(input: { method: "GET" | "POST"; url: string; headers?: Record<string, string>; query?: Record<string, string> }): Promise<T>;
}

export interface PlatformCredentials {
  accessToken: string;
  baseUrl: string;
}

abstract class HttpMetricsClient implements PlatformMetricsClient {
  abstract readonly platform: Platform;
  constructor(protected readonly http: HttpClient, protected readonly credentials: PlatformCredentials) {}
  protected async get<T>(path: string, query: Record<string, string>): Promise<T> {
    return this.http.request<T>({ method: "GET", url: `${this.credentials.baseUrl}${path}`, headers: { Authorization: `Bearer ${this.credentials.accessToken}` }, query });
  }
  abstract fetchMetrics(input: { accountId: string; campaignId?: string; since?: string; until?: string }): Promise<PlatformMetricRecord[]>;
}

export class MetaMetricsClient extends HttpMetricsClient {
  readonly platform = "meta" as const;
  async fetchMetrics(input: { accountId: string; campaignId?: string; since?: string; until?: string }): Promise<PlatformMetricRecord[]> {
    const data = await this.get<{ data?: Array<Record<string, unknown>> }>(`/accounts/${input.accountId}/insights`, { campaign_id: input.campaignId ?? "", since: input.since ?? "", until: input.until ?? "" });
    return (data.data ?? []).map((row) => ({ platform: this.platform, accountId: input.accountId, campaignId: input.campaignId, collectedAt: new Date().toISOString(), externalId: String(row.campaign_id ?? row.id ?? "unknown"), metrics: numericMetrics(row), raw: row }));
  }
}

export class TikTokMetricsClient extends HttpMetricsClient {
  readonly platform = "tiktok" as const;
  async fetchMetrics(input: { accountId: string; campaignId?: string; since?: string; until?: string }): Promise<PlatformMetricRecord[]> {
    const data = await this.get<{ data?: Array<Record<string, unknown>> }>(`/advertiser/${input.accountId}/reports`, { campaign_id: input.campaignId ?? "", start_date: input.since ?? "", end_date: input.until ?? "" });
    return (data.data ?? []).map((row) => ({ platform: this.platform, accountId: input.accountId, campaignId: input.campaignId, collectedAt: new Date().toISOString(), externalId: String(row.campaign_id ?? row.id ?? "unknown"), metrics: numericMetrics(row), raw: row }));
  }
}

export class ShopifyMetricsClient extends HttpMetricsClient {
  readonly platform = "shopify" as const;
  async fetchMetrics(input: { accountId: string; campaignId?: string; since?: string; until?: string }): Promise<PlatformMetricRecord[]> {
    const data = await this.get<{ orders?: Array<Record<string, unknown>> }>(`/admin/api/orders`, { account: input.accountId, since: input.since ?? "", until: input.until ?? "" });
    return (data.orders ?? []).map((row) => ({ platform: this.platform, accountId: input.accountId, campaignId: input.campaignId, collectedAt: new Date().toISOString(), externalId: String(row.id ?? "unknown"), metrics: numericMetrics(row), raw: row }));
  }
}

function numericMetrics(row: Record<string, unknown>): Record<string, number> {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => typeof value === "number"));
}
