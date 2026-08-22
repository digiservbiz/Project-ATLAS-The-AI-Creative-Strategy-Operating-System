import type { ProductInput, UnifiedProductProfile } from "./product-input";
import type { ProductFactExtractor } from "./profile-extraction";
import { ProductInputAggregator } from "./product-input";
import { ProductProfileExtractor } from "./profile-extraction";

export interface ProductPipelineResult { profile: UnifiedProductProfile; readyForStrategy: boolean; warnings: string[]; }

export class ProductIntelligencePipeline {
  private readonly inputs: ProductInputAggregator;
  private readonly profiles: ProductProfileExtractor;

  constructor(extractor: ProductFactExtractor) {
    this.inputs = new ProductInputAggregator({
      async resolve(input) {
        const locator = input.type === "url" ? input.url : input.assetUrl;
        return { id: `${input.type}:${locator}`, type: input.type, locator, metadata: input.type === "document" ? { filename: input.filename, mimeType: input.mimeType } : { filename: input.type === "image" ? input.filename : undefined } };
      },
    });
    this.profiles = new ProductProfileExtractor(extractor);
  }

  async run(inputs: ProductInput[]): Promise<ProductPipelineResult> {
    const intake = await this.inputs.aggregate(inputs);
    const profile = await this.profiles.build(intake.sources, intake.productId);
    const warnings = profile.conflicts.map((conflict) => `${conflict.field}: ${conflict.message}`);
    const readyForStrategy = Boolean(profile.name || profile.description || profile.features.length || profile.benefits.length) && warnings.length === 0;
    return { profile, readyForStrategy, warnings };
  }
}
