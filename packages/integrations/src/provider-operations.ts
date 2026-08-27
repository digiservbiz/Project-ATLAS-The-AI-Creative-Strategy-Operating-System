import type { Platform, PlatformResponse, PlatformTransport } from "./platform-transports";
import type { Operation } from "./platform-operations";

export interface CampaignCreateInput { name: string; objective: string; dailyBudget?: number; currency?: string; status?: "PAUSED" | "ACTIVE"; }
export interface CreativeCreateInput { name: string; mediaUrl: string; copy: string; destinationUrl: string; }
export interface MetricsQuery { accountId: string; startDate: string; endDate: string; cursor?: string; }

export interface ProviderOperations {
  createCampaign(input: CampaignCreateInput, accessToken: string): Promise<PlatformResponse>;
  pauseCampaign(externalCampaignId: string, accessToken: string): Promise<PlatformResponse>;
  resumeCampaign(externalCampaignId: string, accessToken: string): Promise<PlatformResponse>;
  createCreative(input: CreativeCreateInput, accessToken: string): Promise<PlatformResponse>;
  fetchMetrics(query: MetricsQuery, accessToken: string): Promise<PlatformResponse>;
}

abstract class BaseProviderOperations implements ProviderOperations {
  abstract readonly platform: Platform;
  constructor(protected readonly transport: PlatformTransport) {}
  protected request<T>(operation: Operation, path: string, accessToken: string, body?: unknown, query?: Record<string,string>): Promise<PlatformResponse<T>> {
    return this.transport.request<T>({ method: operation === "fetch_metrics" ? "GET" : "POST", path, body, query }, accessToken);
  }
  abstract createCampaign(input: CampaignCreateInput, accessToken: string): Promise<PlatformResponse>;
  abstract pauseCampaign(id: string, accessToken: string): Promise<PlatformResponse>;
  abstract resumeCampaign(id: string, accessToken: string): Promise<PlatformResponse>;
  abstract createCreative(input: CreativeCreateInput, accessToken: string): Promise<PlatformResponse>;
  abstract fetchMetrics(query: MetricsQuery, accessToken: string): Promise<PlatformResponse>;
}

export class MetaProviderOperations extends BaseProviderOperations {
  readonly platform = "meta" as const;
  createCampaign(i: CampaignCreateInput, t: string) { return this.request("create_campaign", "/campaigns", t, i); }
  pauseCampaign(id: string, t: string) { return this.request("pause_campaign", `/campaigns/${encodeURIComponent(id)}/pause`, t); }
  resumeCampaign(id: string, t: string) { return this.request("resume_campaign", `/campaigns/${encodeURIComponent(id)}/resume`, t); }
  createCreative(i: CreativeCreateInput, t: string) { return this.request("create_creative", "/creatives", t, i); }
  fetchMetrics(q: MetricsQuery, t: string) { return this.request("fetch_metrics", "/insights", t, undefined, q as unknown as Record<string,string>); }
}

export class TikTokProviderOperations extends MetaProviderOperations { readonly platform = "tiktok" as const; }
export class ShopifyProviderOperations extends MetaProviderOperations { readonly platform = "shopify" as const; }
