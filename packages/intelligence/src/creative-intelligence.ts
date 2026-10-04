import type { CreativeArtifact, CreativeEvidence, CreativeIngestionQuery, CreativeIntelligenceInsight, CreativeSource, CreativeSourceAdapter } from "@atlas/contracts";

export interface CreativeIntelligenceEngine { analyze(artifacts: readonly CreativeArtifact[]): CreativeIntelligenceInsight[]; }

function text(artifact: CreativeArtifact): string {
  return [artifact.title, artifact.primaryText, artifact.headline, artifact.description].filter((value): value is string => Boolean(value?.trim())).join(" ").toLowerCase();
}

function conceptFor(artifact: CreativeArtifact): string {
  const value = text(artifact);
  if (/(problem|pain|struggle|frustrat)/.test(value)) return "problem-solution";
  if (/(before|after|result|increase|save|faster)/.test(value)) return "transformation";
  if (/(limited|today|now|offer|discount|sale)/.test(value)) return "urgency-offer";
  if (/(review|customer|testimonial|trusted)/.test(value)) return "social-proof";
  return "benefit-led";
}

export class DeterministicCreativeIntelligence implements CreativeIntelligenceEngine {
  analyze(artifacts: readonly CreativeArtifact[]): CreativeIntelligenceInsight[] {
    const groups = new Map<string, CreativeArtifact[]>();
    for (const artifact of artifacts) { const concept = conceptFor(artifact); const group = groups.get(concept) ?? []; group.push(artifact); groups.set(concept, group); }
    return [...groups.entries()].map(([concept, group]) => ({
      concept, evidenceIds: group.map((artifact) => artifact.source.sourceId),
      confidence: Math.min(0.95, 0.55 + group.length * 0.1),
      caveats: ["Pattern detection is heuristic; observed creative presence does not prove performance."],
      observedPatterns: [
        group.length + " creative" + (group.length === 1 ? "" : "s") + " matched this concept.",
        ...new Set(group.flatMap((artifact) => [artifact.callToAction ? "CTA: " + artifact.callToAction : "", artifact.language ? "Language: " + artifact.language : "", artifact.source.platform ? "Platform: " + artifact.source.platform : ""].filter(Boolean))),
      ],
    })).sort((a, b) => b.confidence - a.confidence || a.concept.localeCompare(b.concept));
  }
}

export class AuthorizedCreativeSourceRegistry {
  private readonly adapters = new Map<CreativeSource, CreativeSourceAdapter>();
  register(adapter: CreativeSourceAdapter): void { if (this.adapters.has(adapter.source)) throw new Error("Creative source already registered: " + adapter.source); this.adapters.set(adapter.source, adapter); }
  get(source: CreativeSource): CreativeSourceAdapter { const adapter = this.adapters.get(source); if (!adapter) throw new Error("Creative source not registered: " + source); return adapter; }
  async search(query: CreativeIngestionQuery): Promise<CreativeArtifact[]> {
    if (!query.organizationId.trim()) throw new Error("CREATIVE_SCOPE_REQUIRED");
    if (!query.source) return [];
    const artifacts = await this.get(query.source).search(query);
    return artifacts.filter((artifact) => artifact.organizationId === query.organizationId);
  }
}

export function createAuthorizedCreativeArtifact(input: Omit<CreativeArtifact, "source"> & { source: CreativeEvidence }): CreativeArtifact {
  if (!input.organizationId.trim()) throw new Error("CREATIVE_SCOPE_REQUIRED");
  return { ...input, mediaUrls: input.mediaUrls ? [...input.mediaUrls] : undefined, metadata: { ...(input.metadata ?? {}) } };
}