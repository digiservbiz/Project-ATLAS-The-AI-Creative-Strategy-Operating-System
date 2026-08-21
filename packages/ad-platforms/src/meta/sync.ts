import type { NormalizedAd, NormalizedAdSet, NormalizedCampaign, NormalizedCreative } from "../normalized-model";
import { mapMetaAd, mapMetaAdSet, mapMetaCampaign, mapMetaCreative } from "./mapper";

export interface MetaSyncTransport {
  get(path: string, params?: Record<string, string>): Promise<Record<string, unknown>>;
}

export interface MetaAccountSnapshot {
  campaigns: NormalizedCampaign[];
  adSets: NormalizedAdSet[];
  ads: NormalizedAd[];
  creatives: NormalizedCreative[];
}

export class MetaAccountSync {
  constructor(private readonly transport: MetaSyncTransport, private readonly organizationId: string, private readonly accountId: string) {}

  async sync(): Promise<MetaAccountSnapshot> {
    const campaignsResponse = await this.transport.get(`${this.accountId}/campaigns`, {
      fields: "id,name,status,objective,daily_budget,currency",
      limit: "100",
    });
    const campaigns = ((campaignsResponse.data as Record<string, unknown>[]) ?? []).map((item) => mapMetaCampaign(item as never, this.organizationId, this.accountId));

    const adSets: NormalizedAdSet[] = [];
    const ads: NormalizedAd[] = [];
    const creatives: NormalizedCreative[] = [];

    for (const campaign of campaigns) {
      const adSetsResponse = await this.transport.get(`${campaign.campaignId}/adsets`, {
        fields: "id,campaign_id,name,status,targeting",
        limit: "100",
      });
      for (const item of (adSetsResponse.data as Record<string, unknown>[]) ?? []) {
        const adSet = mapMetaAdSet(item as never, this.organizationId, this.accountId);
        adSets.push(adSet);

        const adsResponse = await this.transport.get(`${adSet.adSetId}/ads`, {
          fields: "id,campaign_id,adset_id,name,status,creative{id}",
          limit: "100",
        });
        for (const adItem of (adsResponse.data as Record<string, unknown>[]) ?? []) {
          const ad = mapMetaAd(adItem as never, this.organizationId, this.accountId);
          ads.push(ad);
          if (ad.creativeId) {
            const creativeResponse = await this.transport.get(ad.creativeId, {
              fields: "id,name,body,title,description,image_url,video_url,link_url",
            });
            if (creativeResponse.id) creatives.push(mapMetaCreative(creativeResponse as never, this.organizationId, this.accountId));
          }
        }
      }
    }

    return { campaigns, adSets, ads, creatives };
  }
}
