export interface ApprovedCreative { id: string; assetUrl: string; kind: "image" | "video"; status: "approved"; }
export interface CampaignSpec { id: string; productId: string; objective: string; creatives: ApprovedCreative[]; budget?: { amount: number; currency: string; daily: boolean }; destinationUrl?: string; }

export interface CampaignExecutor { create(spec: CampaignSpec): Promise<{ externalCampaignId: string; status: "created" | "failed"; error?: string }>; }

export class CampaignAssembler {
  build(productId: string, objective: string, creatives: ApprovedCreative[], options: Pick<CampaignSpec, "budget" | "destinationUrl"> = {}): CampaignSpec {
    if (!creatives.length) throw new Error("At least one approved creative is required");
    if (creatives.some((creative) => creative.status !== "approved")) throw new Error("Only approved creatives can be assembled");
    return { id: `campaign:${productId}:${Date.now()}`, productId, objective, creatives, ...options };
  }
}
