import type { EvidenceType, ResearchCategory, ResearchCollector, ResearchEvidence, ResearchQuery } from "./research-intelligence-hub";

export interface ResearchSourceAdapter {
  id: string;
  categories: ResearchCategory[];
  search(input: { question: string; entity?: string; freshnessDays: number }): Promise<unknown[]>;
}

export interface CollectorConfig { enabled?: boolean; freshnessDays?: number; }

export class SourceCollector implements ResearchCollector {
  constructor(private readonly source: ResearchSourceAdapter, private readonly config: CollectorConfig = {}) {}

  supports(query: ResearchQuery): boolean {
    return this.config.enabled !== false && this.source.categories.includes(query.category);
  }

  async collect(query: ResearchQuery): Promise<ResearchEvidence[]> {
    const rows = await this.source.search({ question: query.question, entity: query.entity, freshnessDays: query.freshnessDays ?? this.config.freshnessDays ?? 30 });
    return rows.map((row, index) => this.normalize(row, query, index));
  }

  private normalize(row: unknown, query: ResearchQuery, index: number): ResearchEvidence {
    const value = row && typeof row === "object" ? row as Record<string, unknown> : { value: row };
    const sourceUrl = typeof value.url === "string" ? value.url : undefined;
    const title = typeof value.title === "string" ? value.title : undefined;
    const excerpt = typeof value.excerpt === "string" ? value.excerpt : typeof value.text === "string" ? value.text : undefined;
    const type = this.evidenceType(query.category, value.type);
    const confidence = typeof value.confidence === "number" ? Math.max(0, Math.min(1, value.confidence)) : 0.5;
    return {
      id: `evidence:${this.source.id}:${query.id}:${index}`,
      source: this.source.id,
      sourceUrl,
      type,
      collectedAt: typeof value.collectedAt === "string" ? value.collectedAt : new Date().toISOString(),
      title,
      excerpt,
      facts: value,
      confidence,
    };
  }

  private evidenceType(category: ResearchCategory, candidate: unknown): EvidenceType {
    const allowed: EvidenceType[] = ["observation", "review", "discussion", "ad_example", "trend", "benchmark", "search_signal", "product_fact"];
    if (typeof candidate === "string" && allowed.includes(candidate as EvidenceType)) return candidate as EvidenceType;
    if (category === "customer") return "observation";
    if (category === "market") return "trend";
    if (category === "product") return "product_fact";
    if (category === "creative" || category === "competitor") return "ad_example";
    return "observation";
  }
}

export class ResearchCollectorRegistry {
  private readonly collectors = new Map<string, ResearchCollector>();

  register(id: string, collector: ResearchCollector): void {
    if (!id.trim()) throw new Error("Collector id is required");
    if (this.collectors.has(id)) throw new Error(`Collector already registered: ${id}`);
    this.collectors.set(id, collector);
  }

  unregister(id: string): boolean { return this.collectors.delete(id); }
  get(id: string): ResearchCollector | undefined { return this.collectors.get(id); }
  all(): ResearchCollector[] { return [...this.collectors.values()]; }
}

export function createBuiltInSourceAdapters(deps: {
  webSearch?: ResearchSourceAdapter["search"];
  reddit?: ResearchSourceAdapter["search"];
  trends?: ResearchSourceAdapter["search"];
  reviews?: ResearchSourceAdapter["search"];
  competitorAds?: ResearchSourceAdapter["search"];
}): ResearchSourceAdapter[] {
  const adapters: ResearchSourceAdapter[] = [];
  const add = (id: string, categories: ResearchCategory[], search?: ResearchSourceAdapter["search"]) => {
    if (search) adapters.push({ id, categories, search });
  };
  add("web-search", ["competitor", "customer", "market", "product", "creative"], deps.webSearch);
  add("reddit", ["customer", "market", "creative"], deps.reddit);
  add("trends", ["market", "customer", "creative"], deps.trends);
  add("reviews", ["customer", "product", "competitor"], deps.reviews);
  add("competitor-ads", ["competitor", "creative", "market"], deps.competitorAds);
  return adapters;
}
