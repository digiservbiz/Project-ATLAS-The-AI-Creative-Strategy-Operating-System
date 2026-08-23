export type ResearchSourceKind = "first_party" | "public_web" | "public_ads" | "search" | "community" | "reviews" | "benchmarks" | "industry_reports";
export type ResearchCapability = "competitor_ads" | "market_trends" | "customer_reviews" | "community_discussions" | "search_behavior" | "public_ad_examples" | "industry_benchmarks" | "product_category" | "creative_trends" | "audience_pain_points";

export interface ResearchRequest { capability: ResearchCapability; query: string; productId?: string; }
export interface ResearchEvidence { id: string; providerId: string; capability: ResearchCapability; sourceKind: ResearchSourceKind; title: string; url?: string; excerpt?: string; observedAt: string; confidence: number; }
export interface ResearchProvider { id: string; capabilities: ResearchCapability[]; sourceKind: ResearchSourceKind; search(request: ResearchRequest): Promise<ResearchEvidence[]>; }

export class ResearchProviderRegistry {
  private readonly providers = new Map<string, ResearchProvider>();
  register(provider: ResearchProvider): void { this.providers.set(provider.id, provider); }
  available(capability: ResearchCapability): ResearchProvider[] { return [...this.providers.values()].filter((provider) => provider.capabilities.includes(capability)); }
  async research(request: ResearchRequest): Promise<ResearchEvidence[]> {
    const providers = this.available(request.capability);
    const results = await Promise.all(providers.map((provider) => provider.search(request)));
    return results.flat().sort((a, b) => b.confidence - a.confidence);
  }
}
