export interface NormalizedCampaign {
  platform: "meta" | "tiktok" | "google";
  organizationId: string;
  accountId: string;
  campaignId: string;
  name: string;
  status: string;
  objective?: string;
  dailyBudget?: number;
  currency?: string;
  raw?: Record<string, unknown>;
}

export interface NormalizedAdSet {
  platform: NormalizedCampaign["platform"];
  organizationId: string;
  accountId: string;
  campaignId: string;
  adSetId: string;
  name: string;
  status: string;
  targeting?: Record<string, unknown>;
  raw?: Record<string, unknown>;
}

export interface NormalizedAd {
  platform: NormalizedCampaign["platform"];
  organizationId: string;
  accountId: string;
  campaignId: string;
  adSetId?: string;
  adId: string;
  name: string;
  status: string;
  creativeId?: string;
  raw?: Record<string, unknown>;
}

export interface NormalizedCreative {
  platform: NormalizedCampaign["platform"];
  organizationId: string;
  accountId: string;
  creativeId: string;
  name?: string;
  primaryText?: string;
  headline?: string;
  description?: string;
  mediaUrls?: string[];
  landingPageUrl?: string;
  raw?: Record<string, unknown>;
}
