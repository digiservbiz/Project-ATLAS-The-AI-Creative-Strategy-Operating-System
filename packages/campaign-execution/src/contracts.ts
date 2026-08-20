export type AdPlatform = "meta" | "tiktok" | "google" | "pinterest" | "snapchat";
export type CampaignAction = "create_campaign" | "pause_campaign" | "resume_campaign" | "update_budget" | "create_ad";

export interface CampaignSpec {
  organizationId: string;
  name: string;
  objective: string;
  dailyBudget?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

export interface CampaignActionRequest {
  organizationId: string;
  platform: AdPlatform;
  action: CampaignAction;
  campaignId?: string;
  campaign?: CampaignSpec;
  budget?: number;
  idempotencyKey: string;
  requiresApproval?: boolean;
}

export interface CampaignRef {
  platform: AdPlatform;
  campaignId: string;
  status: string;
  raw?: Record<string, unknown>;
}

export interface CampaignPlatformClient {
  readonly platform: AdPlatform;
  execute(request: CampaignActionRequest): Promise<CampaignRef>;
}
