import type { StrategyBrief } from "@atlas/strategy";
import type { CreativeGenerationRequest } from "./provider";

export interface CreativePlan { productId: string; jobs: CreativeGenerationRequest[]; }

export class StrategyCreativeBridge {
  build(strategy: StrategyBrief): CreativePlan {
    const angles = strategy.angles.length ? strategy.angles : [strategy.positioning];
    const jobs = angles.flatMap((angle, index) => [
      { jobId: `${strategy.productId}:image:${index + 1}`, kind: "image" as const, prompt: `Create a performance advertising image for ${strategy.positioning}. Angle: ${angle}. Audience: ${strategy.audience.join(", ")}. Use only supported claims: ${strategy.claims.join(", ")}.`, aspectRatio: "4:5" as const, metadata: { productId: strategy.productId, angle } },
      { jobId: `${strategy.productId}:video:${index + 1}`, kind: "video" as const, prompt: `Create a short-form product video. Hook around ${angle}. Positioning: ${strategy.positioning}. Audience: ${strategy.audience.join(", ")}. Claims: ${strategy.claims.join(", ")}.`, aspectRatio: "9:16" as const, metadata: { productId: strategy.productId, angle } },
    ]);
    return { productId: strategy.productId, jobs };
  }
}
