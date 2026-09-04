export type ResearchSourceType = "search" | "review" | "community" | "competitor" | "trend" | "benchmark";

export interface ResearchQuery {
  organizationId: string;
  projectId: string;
  query: string;
  source?: ResearchSourceType;
  market?: string;
  language?: string;
  limit?: number;
}

export interface ResearchProvenance {
  sourceType: ResearchSourceType;
  sourceId: string;
  sourceUrl?: string;
  publisher?: string;
  retrievedAt: string;
}

export interface ResearchFinding {
  id: string;
  organizationId: string;
  projectId: string;
  title: string;
  content: string;
  sourceType: ResearchSourceType;
  provenance: ResearchProvenance;
  evidenceStrength: "low" | "medium" | "high";
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface ResearchSourceAdapter {
  readonly sourceType: ResearchSourceType;
  search(query: ResearchQuery): Promise<ResearchFinding[]>;
}

export interface ResearchFindingStore {
  findBySource(sourceType: ResearchSourceType, sourceId: string): Promise<ResearchFinding | null>;
  upsert(finding: ResearchFinding): Promise<void>;
}

export interface ResearchFindingIndexer {
  index(finding: ResearchFinding): Promise<void>;
}

export interface ResearchIngestionResult {
  findings: ResearchFinding[];
  inserted: number;
  updated: number;
}

/** Provider-neutral research ingestion with provenance, tenant isolation and indexing hooks. */
export class ResearchIntelligenceService {
  constructor(
    private readonly adapters: ResearchSourceAdapter[],
    private readonly store?: ResearchFindingStore,
    private readonly indexer?: ResearchFindingIndexer,
  ) {}

  async ingest(query: ResearchQuery): Promise<ResearchFinding[]> {
    return (await this.ingestAndIndex(query)).findings;
  }

  async ingestAndIndex(query: ResearchQuery): Promise<ResearchIngestionResult> {
    assertScope(query);
    const adapters = this.adapters.filter((adapter) => !query.source || adapter.sourceType === query.source);
    const batches = await Promise.all(adapters.map((adapter) => adapter.search(query)));
    const findings = deduplicate(batches.flat()).map((finding) => normalizeFinding(finding, query));

    let inserted = 0;
    let updated = 0;
    for (const finding of findings) {
      const existing = this.store
        ? await this.store.findBySource(finding.sourceType, finding.provenance.sourceId)
        : null;
      if (existing) updated += 1;
      else inserted += 1;
      if (this.store) await this.store.upsert(finding);
      if (this.indexer) await this.indexer.index(finding);
    }
    return { findings, inserted, updated };
  }
}

function assertScope(query: ResearchQuery): void {
  if (!query.organizationId.trim()) throw new Error("Research organizationId is required");
  if (!query.projectId.trim()) throw new Error("Research projectId is required");
  if (!query.query.trim()) throw new Error("Research query is required");
}

function normalizeFinding(finding: ResearchFinding, query: ResearchQuery): ResearchFinding {
  if (finding.organizationId !== query.organizationId || finding.projectId !== query.projectId) {
    throw new Error("Research finding tenant scope mismatch");
  }
  return {
    ...finding,
    title: finding.title.trim(),
    content: finding.content.trim(),
    tags: [...new Set(finding.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))],
    provenance: { ...finding.provenance, retrievedAt: finding.provenance.retrievedAt || new Date().toISOString() },
  };
}

function deduplicate(items: ResearchFinding[]): ResearchFinding[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.sourceType}:${item.provenance.sourceId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
