import type { CampaignSnapshot, CampaignStateStore } from "@atlas/campaign";
import { PlatformExecutionAdapter, type ApprovedCreative, type PublishResult } from "./platform-execution-adapter";

export interface CampaignExecutionResult { campaign: CampaignSnapshot; publications: PublishResult[]; }

export class CampaignExecutionService {
  constructor(private readonly state: CampaignStateStore, private readonly platforms: PlatformExecutionAdapter) {}

  async publishApproved(campaignId: string, creatives: ApprovedCreative[]): Promise<CampaignExecutionResult> {
    const campaign = await this.state.get(campaignId);
    if (!campaign) throw new Error(`Campaign not found: ${campaignId}`);
    if (campaign.approval !== "approved") throw new Error(`Campaign ${campaignId} is not approved for publishing`);
    if (campaign.status === "failed" || campaign.status === "archived") throw new Error(`Campaign ${campaignId} cannot be published in status ${campaign.status}`);

    const publications: PublishResult[] = [];
    for (const creative of creatives) {
      const result = await this.platforms.publish(creative);
      publications.push(result);
    }

    await this.state.save({
      ...campaign,
      stage: "distribution",
      status: publications.some((p) => p.status === "failed") ? "blocked" : "running",
      distribution: { publications, publishedAt: new Date().toISOString() },
      artifacts: [...campaign.artifacts, ...publications.filter((p) => p.status === "published").map((p) => `${p.platform}:${p.externalId}`)],
    });

    const updated = await this.state.get(campaignId);
    return { campaign: updated ?? campaign, publications };
  }
}
