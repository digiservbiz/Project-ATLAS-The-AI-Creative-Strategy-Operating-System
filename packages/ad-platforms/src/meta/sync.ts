import type { NormalizedAd, NormalizedAdSet, NormalizedCampaign, NormalizedCreative } from "../normalized-model";
import { mapMetaAd, mapMetaAdSet, mapMetaCampaign, mapMetaCreative } from "./mapper";
import { fetchAllPages } from "./pagination";

export interface MetaSyncTransport {
  get(path: string, params?: Record<string, string>): Promise<{ data?: unknown[]; paging?: { next?: string }; id?: string; [key: string]: unknown }>;
}

export interface MetaAccountSnapshot {
  campaigns: NormalizedCampaign[];
  adSets: NormalizedAdSet[];
  ads: NormalizedAd[];
  creatives: NormalizedCreative[];
}

export class MetaAccountSync {
  constructor(private readonly transport: MetaSyncTransport, private readonly organizationId: string, private readonly accountId: string, private readonly maxPages = 50) {}

  async sync(): Promise<MetaAccountSnapshot> {
    const campaignsRaw = await fetchAllPages<Record<string, unknown>>(this.transport, `${this.accountId}/campaigns`, {
      fields: "id,name,status,objective,daily_budget,currency",
      limit: "100",
    }, this.maxPages);
    const campaigns = campaignsRaw.map((item) => mapMetaCampaign(item as never, this.organizationId, this.accountId));

    const adSets: NormalizedAdSet[] = [];
    const ads: NormalizedAd[] = [];
    const creatives: NormalizedCreative[] = [];

    for (const campaign of campaigns) {
      const adSetsRaw = await fetchAllPages<Record<string, unknown>>(this.transport, `${campaign.campaignId}/adsets`, {
        fields: "id,campaign_id,name,status,targeting",
        limit: "100",
      }, this.maxPages);
      for (const item of adSetsRaw) {
        const adSet = mapMetaAdSet(item as never, this.organizationId, this.accountId);
        adSets.push(adSet);

        const adsRaw = await fetchAllPages<Record<string, unknown>>(this.transport, `${adSet.adSetId}/ads`, {
          fields: "id,campaign_id,adset_id,name,status,creative{id}",
          limit: "100",
        }, this.maxPages);
        for (const adItem of adsRaw) {
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
