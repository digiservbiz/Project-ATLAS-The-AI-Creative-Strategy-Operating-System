import type { IntelligenceSnapshot } from "@atlas/intelligence";
import type { ProductAnalysis } from "./product-url";
import type { CreativeBrief } from "./creative-production";

export interface StrategyPack {
  businessId: string;
  objective: string;
  positioning: string[];
  audience: string[];
  objections: string[];
  angles: string[];
  creativeBriefs: CreativeBrief[];
  intelligence: {
    nextBestActionId?: string;
    nextBestActionReason?: string;
    confidence: number;
    requiresApproval: boolean;
  };
}

/**
 * Converts product intelligence plus the current ATLAS brain into a deterministic,
 * agent-ready strategy package. LLMs/providers can enrich the copy later without
 * changing the contract or bypassing intelligence decisions.
 */
export function buildStrategyPack(
  analysis: ProductAnalysis,
  snapshot: IntelligenceSnapshot,
  creativeBriefs: CreativeBrief[],
  objective = "Launch a performance creative test",
): StrategyPack {
  if (snapshot.state.businessId !== snapshot.business.business.id) {
    throw new Error("Intelligence snapshot business/state scope mismatch");
  }

  const top = snapshot.nextBestActions[0];
  const angles = [...new Set([
    ...analysis.creativeAngles,
    ...creativeBriefs.map((brief) => brief.angle),
  ])].filter(Boolean);

  return {
    businessId: snapshot.state.businessId,
    objective,
    positioning: [...analysis.valuePropositions],
    audience: [...analysis.likelyAudience],
    objections: [...analysis.objections],
    angles,
    creativeBriefs: creativeBriefs.map((brief) => ({ ...brief })),
    intelligence: {
      nextBestActionId: top?.id,
      nextBestActionReason: top?.reason,
      confidence: top?.confidence ?? 0.5,
      requiresApproval: top?.requiredApproval ?? false,
    },
  };
}
