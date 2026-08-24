export type ResearchCategory = "competitor" | "customer" | "market" | "product" | "creative";
export type EvidenceType = "observation" | "review" | "discussion" | "ad_example" | "trend" | "benchmark" | "search_signal" | "product_fact";

export interface ResearchQuery { id: string; category: ResearchCategory; question: string; entity?: string; freshnessDays?: number; }
export interface ResearchEvidence { id: string; source: string; sourceUrl?: string; type: EvidenceType; collectedAt: string; title?: string; excerpt?: string; facts: Record<string, unknown>; confidence: number; }
export interface ResearchInsight { id: string; category: ResearchCategory; subject: string; claim: string; evidenceIds: string[]; confidence: number; freshness: "fresh" | "stale"; recommendations: string[]; createdAt: string; }
export interface ResearchCollector { supports(query: ResearchQuery): boolean; collect(query: ResearchQuery): Promise<ResearchEvidence[]>; }
export interface ResearchStore { saveEvidence(evidence: ResearchEvidence[]): Promise<void>; saveInsights(insights: ResearchInsight[]): Promise<void>; }

export class ResearchIntelligenceHub {
  constructor(private readonly collectors: ResearchCollector[], private readonly store: ResearchStore) {}

  async research(query: ResearchQuery): Promise<ResearchInsight[]> {
    const collectors = this.collectors.filter((collector) => collector.supports(query));
    const batches = await Promise.all(collectors.map((collector) => collector.collect(query)));
    const evidence = batches.flat();
    await this.store.saveEvidence(evidence);
    const insights = this.synthesize(query, evidence);
    await this.store.saveInsights(insights);
    return insights;
  }

  private synthesize(query: ResearchQuery, evidence: ResearchEvidence[]): ResearchInsight[] {
    if (!evidence.length) return [];
    const weighted = evidence.reduce((sum, item) => sum + item.confidence, 0) / evidence.length;
    const freshnessDays = query.freshnessDays ?? 30;
    const cutoff = Date.now() - freshnessDays * 86_400_000;
    const fresh = evidence.filter((item) => Date.parse(item.collectedAt) >= cutoff).length >= Math.ceil(evidence.length / 2);
    const claims = evidence.map((item) => item.excerpt || item.title || `${item.type} from ${item.source}`).slice(0, 5);
    return [{
      id: `insight:${query.id}:${Date.now()}`,
      category: query.category,
      subject: query.entity ?? query.question,
      claim: claims.join(" | "),
      evidenceIds: evidence.map((item) => item.id),
      confidence: Math.min(0.98, weighted * Math.min(1, 0.5 + evidence.length / 10)),
      freshness: fresh ? "fresh" : "stale",
      recommendations: this.recommend(query, evidence),
      createdAt: new Date().toISOString(),
    }];
  }

  private recommend(query: ResearchQuery, evidence: ResearchEvidence[]): string[] {
    if (query.category === "competitor") return ["Compare repeated competitor patterns before adopting them.", "Treat isolated ad examples as hypotheses, not proof."];
    if (query.category === "customer") return ["Reuse recurring customer language in hooks and messaging.", "Prioritize pain points supported by multiple independent sources."];
    if (query.category === "market") return ["Separate durable category signals from short-lived trends.", "Validate high-impact trends with multiple sources."];
    if (query.category === "product") return ["Map verified product facts to customer outcomes and differentiators."];
    return ["Convert recurring creative patterns into controlled test hypotheses.", "Do not treat creative examples as performance evidence without results data."];
  }
}
