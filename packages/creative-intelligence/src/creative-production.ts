import type { ProductAnalysis } from "./product-url";

export interface CreativeBrief { angle: string; hook: string; format: "image" | "video"; aspectRatio: "1:1" | "4:5" | "9:16" | "16:9"; prompt: string; destinationUrl: string; }
export interface ImageGenerator { generate(prompt: string, aspectRatio: CreativeBrief["aspectRatio"]): Promise<{ assetUrl: string }>; }
export interface VideoGenerator { generate(prompt: string, aspectRatio: CreativeBrief["aspectRatio"]): Promise<{ assetUrl: string }>; }

export class CreativeProductionPlanner {
  plan(analysis: ProductAnalysis): CreativeBrief[] {
    const url = analysis.product.canonicalUrl ?? analysis.product.url;
    return analysis.creativeAngles.flatMap((angle, index) => [
      { angle, hook: analysis.valuePropositions[index % Math.max(1, analysis.valuePropositions.length)] ?? "Show the product and its main benefit", format: "image", aspectRatio: "4:5", prompt: `Create a conversion-focused ad image for ${analysis.product.title ?? "this product"}. Angle: ${angle}. Highlight the product naturally and use the hook without fabricating claims.`, destinationUrl: url },
      { angle, hook: analysis.valuePropositions[index % Math.max(1, analysis.valuePropositions.length)] ?? "Show the product and its main benefit", format: "video", aspectRatio: "9:16", prompt: `Create a short vertical performance ad for ${analysis.product.title ?? "this product"}. Hook: ${analysis.valuePropositions[index % Math.max(1, analysis.valuePropositions.length)] ?? "show the main benefit"}. Angle: ${angle}. Demonstrate the product and end with a clear call to action.`, destinationUrl: url },
    ]);
  }
}
