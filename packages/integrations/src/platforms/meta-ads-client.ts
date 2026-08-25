import { AuthenticatedPlatformClient, type PlatformTransport } from "./platform-client";

export interface MetaCampaign { id: string; name?: string; status?: string; objective?: string; }
export interface MetaAdSet { id: string; name?: string; campaign_id?: string; status?: string; }
export interface MetaAd { id: string; name?: string; adset_id?: string; status?: string; creative?: unknown; }

export class MetaAdsClient extends AuthenticatedPlatformClient {
  constructor(transport: PlatformTransport, accessToken: string, private readonly apiVersion = "v23.0") { super(transport, accessToken); }
  listCampaigns(accountId: string) { return this.get<{ data: MetaCampaign[] }>(`/${this.apiVersion}/act_${accountId}/campaigns`, { fields: "id,name,status,objective" }); }
  listAdSets(accountId: string) { return this.get<{ data: MetaAdSet[] }>(`/${this.apiVersion}/act_${accountId}/adsets`, { fields: "id,name,campaign_id,status" }); }
  listAds(accountId: string) { return this.get<{ data: MetaAd[] }>(`/${this.apiVersion}/act_${accountId}/ads`, { fields: "id,name,adset_id,status,creative" }); }
  getInsights(accountId: string, params: Record<string, string>) { return this.get<{ data: unknown[] }>(`/${this.apiVersion}/act_${accountId}/insights`, params); }
  createCampaign(accountId: string, payload: Record<string, unknown>) { return this.post<MetaCampaign>(`/${this.apiVersion}/act_${accountId}/campaigns`, payload); }
}
