import type {
  CreativeArtifact,
  CreativeIngestionQuery,
  CreativeIntelligenceInsight,
  CreativeSourceAdapter,
} from "@atlas/contracts";

export * from "./research-ingestion";

export interface CreativeArtifactStore {
  upsert(artifact: CreativeArtifact): Promise<void>;
  findBySource(source: string, sourceId: string): Promise<CreativeArtifact | null>;
}

export interface CreativeIndexer {
  index(artifact: CreativeArtifact): Promise<void>;
}

export interface IngestionResult {
  artifacts: CreativeArtifact[];
  inserted: number;
  updated: number;
}

export class CompetitiveCreativeIntelligenceService {
  constructor(
    private readonly adapters: CreativeSourceAdapter[],
    private readonly store?: CreativeArtifactStore,
    private readonly indexer?: CreativeIndexer,
  ) {}

  async ingest(query: CreativeIngestionQuery): Promise<CreativeArtifact[]> {
    const result = await this.ingestAndIndex(query);
    return result.artifacts;
  }

  async ingestAndIndex(query: CreativeIngestionQuery): Promise<IngestionResult> {
    const adapters = this.adapters.filter((adapter) => !query.source || adapter.source === query.source);
    const batches = await Promise.all(adapters.map((adapter) => adapter.search(query)));
    const artifacts = deduplicate(batches.flat());
    let inserted = 0;
    let updated = 0;

    for (const artifact of artifacts) {
      const existing = this.store
        ? await this.store.findBySource(artifact.source.source, artifact.source.sourceId)
        : null;
      if (existing) updated += 1;
      else inserted += 1;
      if (this.store) await this.store.upsert(artifact);
      if (this.indexer) await this.indexer.index(artifact);
    }

    return { artifacts, inserted, updated };
  }

  buildBasicInsights(artifacts: CreativeArtifact[]): CreativeIntelligenceInsight[] {
    const byCta = new Map<string, CreativeArtifact[]>();
    for (const artifact of artifacts) {
      const cta = artifact.callToAction?.trim().toLowerCase();
      if (!cta) continue;
      const group = byCta.get(cta) ?? [];
      group.push(artifact);
      byCta.set(cta, group);
    }

    return [...byCta.entries()]
      .filter(([, group]) => group.length >= 2)
      .map(([cta, group]) => ({
        concept: `CTA pattern: ${cta}`,
        evidenceIds: group.map((item) => item.id),
        confidence: Math.min(0.95, 0.5 + group.length / 20),
        caveats: ["Presence is not evidence of conversion performance."],
        observedPatterns: [`Observed in ${group.length} ingested creative artifacts.`],
      }));
  }
}

function deduplicate(items: CreativeArtifact[]): CreativeArtifact[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.source.source}:${item.source.sourceId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
