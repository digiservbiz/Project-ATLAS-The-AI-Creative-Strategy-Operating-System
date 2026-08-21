import type { PlatformApiClient, OAuthAuthorization } from "../contracts";
import { mapMetaCampaign, mapMetaAdSet, mapMetaAd, mapMetaCreative } from "./mapper";

export interface MetaTransport {
  get(path: string, params?: Record<string, string>): Promise<Record<string, unknown>>;
  post(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
}

export class MetaAdsClient implements PlatformApiClient {
  readonly platform = "meta" as const;
  constructor(private readonly authorization: OAuthAuthorization, private readonly transport: MetaTransport) {}

  async getAuthorization(): Promise<OAuthAuthorization> { return this.authorization; }

  async fetchCampaignMetrics(input: { campaignIds: string[]; since: string; until: string }): Promise<unknown[]> {
    const result: unknown[] = [];
    for (const campaignId of input.campaignIds) {
      const response = await this.transport.get(`${campaignId}/insights`, {
        fields: "campaign_id,impressions,clicks,spend,conversions,action_values",
        time_range: JSON.stringify({ since: input.since, until: input.until }),
      });
      result.push(...((response.data as unknown[]) ?? []));
    }
    return result;
  }

  async executeCampaignAction(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const campaignId = typeof input.campaignId === "string" ? input.campaignId : undefined;
    if (!campaignId) throw new Error("Meta campaignId is required");
    const action = input.action;
    if (action === "pause_campaign" || action === "resume_campaign") {
      return this.transport.post(campaignId, { status: action === "pause_campaign" ? "PAUSED" : "ACTIVE" });
    }
    throw new Error(`Meta action not implemented by adapter: ${String(action)}`);
  }
}

export const metaMappers = { mapMetaCampaign, mapMetaAdSet, mapMetaAd, mapMetaCreative };
