import { AuthenticatedPlatformClient, type PlatformTransport } from "./platform-client";

export interface TikTokCampaign { campaign_id: string; campaign_name?: string; operation_status?: string; objective_type?: string; }
export interface TikTokAdGroup { adgroup_id: string; adgroup_name?: string; campaign_id?: string; operation_status?: string; }
export interface TikTokAd { ad_id: string; ad_name?: string; adgroup_id?: string; operation_status?: string; }

export class TikTokAdsClient extends AuthenticatedPlatformClient {
  constructor(transport: PlatformTransport, accessToken: string, private readonly basePath = "/open_api/v1.3") { super(transport, accessToken); }
  listCampaigns(advertiserId: string) { return this.get<{ data: { list: TikTokCampaign[] } }>(`${this.basePath}/campaign/get/`, { advertiser_id: advertiserId, fields: "campaign_id,campaign_name,operation_status,objective_type" }); }
  listAdGroups(advertiserId: string) { return this.get<{ data: { list: TikTokAdGroup[] } }>(`${this.basePath}/adgroup/get/`, { advertiser_id: advertiserId }); }
  listAds(advertiserId: string) { return this.get<{ data: { list: TikTokAd[] } }>(`${this.basePath}/ad/get/`, { advertiser_id: advertiserId }); }
  getReport(advertiserId: string, params: Record<string, string>) { return this.get<{ data: unknown }>(`${this.basePath}/report/integrated/get/`, { advertiser_id: advertiserId, ...params }); }
  createCampaign(advertiserId: string, payload: Record<string, unknown>) { return this.post<{ data: TikTokCampaign }>(`${this.basePath}/campaign/create/`, { advertiser_id: advertiserId, ...payload }); }
}
