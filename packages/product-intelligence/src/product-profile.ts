export type ProductInputKind = "url" | "image" | "document";
export interface ProductInput { kind: ProductInputKind; value: string; mimeType?: string; }
export interface ProductProfile { id: string; name?: string; description?: string; features: string[]; benefits: string[]; audience: string[]; painPoints: string[]; objections: string[]; differentiators: string[]; pricing?: { amount?: number; currency?: string; offer?: string }; evidence: Array<{ claim: string; source: string; confidence: number }>; missingInformation: string[]; }
export interface ProductExtractor { extract(input: ProductInput): Promise<Partial<ProductProfile>>; }

export class ProductIntelligenceService {
  constructor(private readonly extractor: ProductExtractor) {}

  async buildProfile(inputs: ProductInput[], id = `product:${Date.now()}`): Promise<ProductProfile> {
    if (!inputs.length) throw new Error("At least one product input is required");
    const parts = await Promise.all(inputs.map((input) => this.extractor.extract(input)));
    const merged = parts.reduce<Partial<ProductProfile>>((acc, part) => ({ ...acc, ...part }), {});
    return {
      id,
      name: merged.name,
      description: merged.description,
      features: merged.features ?? [],
      benefits: merged.benefits ?? [],
      audience: merged.audience ?? [],
      painPoints: merged.painPoints ?? [],
      objections: merged.objections ?? [],
      differentiators: merged.differentiators ?? [],
      pricing: merged.pricing,
      evidence: merged.evidence ?? [],
      missingInformation: merged.missingInformation ?? [],
    };
  }
}
