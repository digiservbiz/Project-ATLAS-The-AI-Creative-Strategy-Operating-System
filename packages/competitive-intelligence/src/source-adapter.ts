import type { CreativeArtifact, CreativeIngestionQuery, CreativeSource, CreativeSourceAdapter } from "@atlas/contracts";

export type FetchJson = (url: string, init?: RequestInit) => Promise<unknown>;

export interface JsonCreativeMapper {
  map(payload: unknown, query: CreativeIngestionQuery): CreativeArtifact[];
}

export class HttpCreativeSourceAdapter implements CreativeSourceAdapter {
  constructor(
    public readonly source: CreativeSource,
    private readonly endpoint: string,
    private readonly fetchJson: FetchJson,
    private readonly mapper: JsonCreativeMapper,
    private readonly headers: Record<string, string> = {},
  ) {}

  async search(query: CreativeIngestionQuery): Promise<CreativeArtifact[]> {
    const url = new URL(this.endpoint);
    if (query.query) url.searchParams.set("query", query.query);
    if (query.advertiser) url.searchParams.set("advertiser", query.advertiser);
    if (query.market) url.searchParams.set("market", query.market);
    if (query.limit) url.searchParams.set("limit", String(query.limit));

    const payload = await this.fetchJson(url.toString(), {
      method: "GET",
      headers: this.headers,
    });
    return this.mapper.map(payload, query);
  }
}
