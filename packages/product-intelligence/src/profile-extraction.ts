import type { ProductSource, UnifiedProductProfile } from "./product-input";

export interface ExtractedProductFacts {
  sourceId: string;
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  features?: string[];
  benefits?: string[];
  audienceSignals?: string[];
  objections?: string[];
  creativeAngles?: string[];
}

export interface ProductFactExtractor {
  extract(source: ProductSource): Promise<ExtractedProductFacts>;
}

export class ProductProfileExtractor {
  constructor(private readonly extractor: ProductFactExtractor) {}

  async build(sources: ProductSource[], productId = `product:${Date.now()}`): Promise<UnifiedProductProfile> {
    if (!sources.length) throw new Error("At least one product source is required");
    const facts = await Promise.all(sources.map((source) => this.extractor.extract(source)));
    const conflicts: UnifiedProductProfile["conflicts"] = [];
    const values = <T>(field: keyof ExtractedProductFacts): T[] => facts.map((fact) => fact[field] as T | undefined).filter((value): value is T => value !== undefined);
    const names = values<string>("name");
    const prices = values<number>("price");
    if (new Set(names.map((value) => value.trim().toLowerCase())).size > 1) conflicts.push({ field: "name", sources: facts.filter((fact) => fact.name).map((fact) => fact.sourceId), message: "Sources disagree on product name" });
    if (new Set(prices).size > 1) conflicts.push({ field: "price", sources: facts.filter((fact) => fact.price !== undefined).map((fact) => fact.sourceId), message: "Sources disagree on product price" });
    const first = facts.find((fact) => fact.name || fact.description || fact.price !== undefined);
    const unique = (field: keyof ExtractedProductFacts) => [...new Set(facts.flatMap((fact) => (fact[field] as string[] | undefined) ?? []))];
    return { productId, sources, name: first?.name, description: first?.description, price: first?.price, currency: first?.currency, features: unique("features"), benefits: unique("benefits"), audienceSignals: unique("audienceSignals"), objections: unique("objections"), creativeAngles: unique("creativeAngles"), conflicts };
  }
}
