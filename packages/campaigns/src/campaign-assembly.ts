export interface ApprovedCreative { id: string; format: "image" | "video"; assetUrl: string; primaryText: string; headline: string; callToAction: string; }
export interface CampaignSpec { name: string; objective: string; budget: { amount: number; currency: string; daily?: boolean }; audience: Record<string, unknown>; creatives: ApprovedCreative[]; requiresApproval: boolean; }
export interface CampaignAdapter { create(spec: CampaignSpec): Promise<{ campaignId: string; status: string }>; }

export class CampaignAssemblyService {
  constructor(private readonly adapter: CampaignAdapter) {}

  async prepareAndCreate(input: Omit<CampaignSpec, "requiresApproval"> & { approved: boolean }) {
    if (!input.approved) return { status: "blocked_pending_approval" as const };
    if (!input.creatives.length) throw new Error("At least one approved creative is required");
    if (input.budget.amount <= 0) throw new Error("Campaign budget must be greater than zero");
    const spec: CampaignSpec = { ...input, requiresApproval: true };
    return this.adapter.create(spec);
  }
}
