export interface EvidenceItem { id: string; claim: string; origin: "first_party" | "external_research" | "hypothesis" | "proven_learning"; confidence: number; source?: string; }
export interface SemanticRetriever { retrieve(query: string, limit?: number, filter?: Record<string, unknown>): Promise<Array<{ id: string; text: string; metadata: Record<string, unknown> }>>; }

export class EvidenceAwareContextBuilder {
  constructor(private readonly retriever: SemanticRetriever) {}

  async build(productContext: string, limit = 10) {
    const records = await this.retriever.retrieve(productContext, limit);
    const evidence: EvidenceItem[] = records.map((record) => ({
      id: record.id,
      claim: record.text,
      origin: (record.metadata.origin as EvidenceItem["origin"]) ?? "external_research",
      confidence: typeof record.metadata.confidence === "number" ? record.metadata.confidence : 0.5,
      source: typeof record.metadata.source === "string" ? record.metadata.source : undefined,
    }));
    return { query: productContext, evidence };
  }
}
