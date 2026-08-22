export type ProductInput =
  | { type: "url"; url: string }
  | { type: "image"; assetUrl: string; filename?: string }
  | { type: "document"; assetUrl: string; filename?: string; mimeType?: string };

export interface ProductSource { id: string; type: ProductInput["type"]; locator: string; metadata?: Record<string, unknown>; }

export interface UnifiedProductProfile {
  productId: string;
  sources: ProductSource[];
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  features: string[];
  benefits: string[];
  audienceSignals: string[];
  objections: string[];
  creativeAngles: string[];
  conflicts: Array<{ field: string; sources: string[]; message: string }>;
}

export interface ProductSourceResolver {
  resolve(input: ProductInput): Promise<ProductSource>;
}

export class ProductInputAggregator {
  constructor(private readonly resolver: ProductSourceResolver) {}

  async aggregate(inputs: ProductInput[]): Promise<UnifiedProductProfile> {
    if (!inputs.length) throw new Error("At least one product input is required");
    const sources = await Promise.all(inputs.map((input) => this.resolver.resolve(input)));
    return {
      productId: `product:${Date.now()}`,
      sources,
      features: [],
      benefits: [],
      audienceSignals: [],
      objections: [],
      creativeAngles: [],
      conflicts: [],
    };
  }
}
