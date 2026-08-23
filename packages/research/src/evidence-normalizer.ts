export type EvidenceOrigin = "first_party" | "external_research" | "hypothesis" | "proven_learning";
export interface RawResearchResult { providerId: string; sourceType: string; title: string; content: string; url?: string; observedAt?: string; confidence?: number; }
export interface ResearchEvidence { id: string; origin: EvidenceOrigin; providerId: string; sourceType: string; claim: string; evidence: string; sourceUrl?: string; observedAt: string; confidence: number; tags: string[]; }

export class EvidenceNormalizer {
  normalize(results: RawResearchResult[], origin: EvidenceOrigin = "external_research"): ResearchEvidence[] {
    return results.filter((r) => r.content.trim()).map((r, index) => ({
      id: `evidence:${Date.now()}:${index}`,
      origin,
      providerId: r.providerId,
      sourceType: r.sourceType,
      claim: r.title.trim(),
      evidence: r.content.trim(),
      sourceUrl: r.url,
      observedAt: r.observedAt ?? new Date().toISOString(),
      confidence: Math.max(0, Math.min(1, r.confidence ?? 0.5)),
      tags: [r.sourceType, r.providerId],
    }));
  }
}
