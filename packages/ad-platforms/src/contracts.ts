export type AdPlatform = "meta" | "tiktok" | "google";

export interface PlatformCredentials {
  accessToken: string;
  accountId: string;
  expiresAt?: string;
}

export interface OAuthAuthorization {
  platform: AdPlatform;
  organizationId: string;
  accountId: string;
  scopes: string[];
  expiresAt?: string;
}

export interface PlatformApiClient {
  readonly platform: AdPlatform;
  getAuthorization(): Promise<OAuthAuthorization>;
  fetchCampaignMetrics(input: { campaignIds: string[]; since: string; until: string }): Promise<unknown[]>;
  executeCampaignAction(input: Record<string, unknown>): Promise<Record<string, unknown>>;
}
