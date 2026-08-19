import type {
  CreativeArtifact,
  CreativeIngestionQuery,
  CreativeIntelligenceInsight,
  CreativeSourceAdapter,
} from "@atlas/contracts";

export class CompetitiveCreativeIntelligenceService {
  constructor(private readonly adapters: CreativeSourceAdapter[]) {}

  async ingest(query: CreativeIngestionQuery): Promise<CreativeArtifact[]> {
    const adapters = this.adapters.filter((adapter) => !query.source || adapter.source === query.source);
    const batches = await Promise.all(adapters.map((adapter) => adapter.search(query)));
    return deduplicate(batches.flat());
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
