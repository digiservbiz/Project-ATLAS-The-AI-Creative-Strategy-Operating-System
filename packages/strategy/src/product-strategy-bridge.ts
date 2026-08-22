import type { UnifiedProductProfile } from "@atlas/product-intelligence";

export interface ProductStrategyInput { productId: string; objective: string; profile: UnifiedProductProfile; }
export interface StrategyBrief { productId: string; objective: string; positioning: string; audience: string[]; angles: string[]; objections: string[]; claims: string[]; confidence: number; }

export class ProductStrategyBridge {
  build(input: ProductStrategyInput): StrategyBrief {
    const { profile } = input;
    const positioning = profile.benefits[0] ?? profile.description ?? "Product-led value proposition";
    const audience = profile.audienceSignals.length ? profile.audienceSignals : ["Test audiences derived from product evidence"];
    const angles = profile.creativeAngles.length ? profile.creativeAngles : profile.benefits.slice(0, 3);
    const claims = [...profile.features, ...profile.benefits].slice(0, 6);
    const confidence = profile.conflicts.length === 0 ? 0.75 : 0.45;
    return { productId: input.productId, objective: input.objective, positioning, audience, angles, objections: profile.objections, claims, confidence };
  }
}
