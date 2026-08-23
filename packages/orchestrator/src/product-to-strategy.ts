import type { ProductInput, ProductProfile, ProductIntelligenceService } from "../../product-intelligence/src/product-profile";
import type { EvidenceAwareContextBuilder } from "./evidence-aware-context";

export interface StrategyGenerator { generate(input: { product: ProductProfile; evidence: unknown[] }): Promise<Record<string, unknown>>; }
export interface ProductToStrategyResult { product: ProductProfile; evidence: unknown[]; strategy: Record<string, unknown>; }

export class ProductToStrategyPipeline {
  constructor(
    private readonly products: ProductIntelligenceService,
    private readonly context: EvidenceAwareContextBuilder,
    private readonly strategy: StrategyGenerator,
  ) {}

  async run(inputs: ProductInput[], productId?: string): Promise<ProductToStrategyResult> {
    const product = await this.products.buildProfile(inputs, productId);
    const query = [product.name, product.description, ...product.benefits, ...product.painPoints].filter(Boolean).join(" ");
    const context = await this.context.build(query || product.id);
    const strategy = await this.strategy.generate({ product, evidence: context.evidence });
    return { product, evidence: context.evidence, strategy };
  }
}
