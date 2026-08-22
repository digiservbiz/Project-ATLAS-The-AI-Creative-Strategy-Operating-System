import type { NormalizedAd, NormalizedAdSet, NormalizedCampaign, NormalizedCreative } from "../normalized-model";
import type { CampaignMetricSnapshot } from "@atlas/performance-intelligence";

export interface AdPlatformRepository {
  upsertCampaign(campaign: NormalizedCampaign): Promise<void>;
  upsertAdSet(adSet: NormalizedAdSet): Promise<void>;
  upsertAd(ad: NormalizedAd): Promise<void>;
  upsertCreative(creative: NormalizedCreative): Promise<void>;
  appendPerformance(snapshot: CampaignMetricSnapshot): Promise<void>;
}

export class InMemoryAdPlatformRepository implements AdPlatformRepository {
  readonly campaigns = new Map<string, NormalizedCampaign>();
  readonly adSets = new Map<string, NormalizedAdSet>();
  readonly ads = new Map<string, NormalizedAd>();
  readonly creatives = new Map<string, NormalizedCreative>();
  readonly performance: CampaignMetricSnapshot[] = [];

  async upsertCampaign(value: NormalizedCampaign) { this.campaigns.set(`${value.organizationId}:${value.platform}:${value.campaignId}`, value); }
  async upsertAdSet(value: NormalizedAdSet) { this.adSets.set(`${value.organizationId}:${value.platform}:${value.adSetId}`, value); }
  async upsertAd(value: NormalizedAd) { this.ads.set(`${value.organizationId}:${value.platform}:${value.adId}`, value); }
  async upsertCreative(value: NormalizedCreative) { this.creatives.set(`${value.organizationId}:${value.platform}:${value.creativeId}`, value); }
  async appendPerformance(value: CampaignMetricSnapshot) { this.performance.push(value); }
}
