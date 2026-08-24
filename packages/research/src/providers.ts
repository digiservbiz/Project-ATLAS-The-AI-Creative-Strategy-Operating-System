import type { EvidenceType, ResearchCategory } from "./research-intelligence-hub";
import type { SourceAdapter, SourceRecord } from "./source-collectors";

export interface ProviderClient { request(path: string, params: Record<string, string>): Promise<unknown>; }

abstract class HttpProviderAdapter implements SourceAdapter {
  abstract readonly id: string;
  abstract readonly categories: ResearchCategory[];
  protected abstract readonly endpoint: string;
  constructor(protected readonly client: ProviderClient) {}
  async search(query: { question: string; entity?: string }): Promise<SourceRecord[]> {
    const payload = await this.client.request(this.endpoint, { q: query.entity ? `${query.entity} ${query.question}` : query.question });
    return this.normalize(payload);
  }
  protected normalize(payload: unknown): SourceRecord[] {
    if (!Array.isArray(payload)) return [{ source: this.id, type: this.defaultType(), facts: { payload }, confidence: 0.35 }];
    return payload.map((item) => ({ source: this.id, type: this.defaultType(), facts: typeof item === "object" && item ? item as Record<string, unknown> : { value: item }, confidence: 0.5 }));
  }
  protected defaultType(): EvidenceType { return "observation"; }
}

export class WebSearchProvider extends HttpProviderAdapter {
  readonly id = "web-search-provider"; readonly categories: ResearchCategory[] = ["competitor", "customer", "market", "product", "creative"]; protected readonly endpoint = "/search";
}
export class RedditProvider extends HttpProviderAdapter {
  readonly id = "reddit-provider"; readonly categories: ResearchCategory[] = ["customer", "market", "creative"]; protected readonly endpoint = "/reddit/search";
  protected defaultType(): EvidenceType { return "discussion"; }
}
export class TrendsProvider extends HttpProviderAdapter {
  readonly id = "trends-provider"; readonly categories: ResearchCategory[] = ["market", "customer", "creative"]; protected readonly endpoint = "/trends";
  protected defaultType(): EvidenceType { return "trend"; }
}
export class ReviewsProvider extends HttpProviderAdapter {
  readonly id = "reviews-provider"; readonly categories: ResearchCategory[] = ["customer", "product", "competitor"]; protected readonly endpoint = "/reviews";
  protected defaultType(): EvidenceType { return "review"; }
}
export class CompetitorAdsProvider extends HttpProviderAdapter {
  readonly id = "competitor-ads-provider"; readonly categories: ResearchCategory[] = ["competitor", "creative", "market"]; protected readonly endpoint = "/ads";
  protected defaultType(): EvidenceType { return "ad_example"; }
}
