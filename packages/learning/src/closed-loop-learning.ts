export type LearningCategory = "winner" | "weakness" | "audience" | "optimization";

export interface PerformanceSignal { id: string; subject: string; metrics: Record<string, number>; evidence: string[]; }
export interface LearningMemory { id: string; sourceId: string; category: LearningCategory; statement: string; confidence: number; tags: string[]; createdAt: string; }
export interface LearningMemoryPort { persist(items: Array<Omit<LearningMemory, "id" | "createdAt">>): Promise<LearningMemory[]>; retrieve(query: string, limit?: number): Promise<LearningMemory[]>; }
export interface StrategyDecision { id: string; objective: string; context: Record<string, unknown>; constraints: string[]; recommendations: string[]; evidenceMemoryIds: string[]; }
export interface StrategyPort { createDecision(input: Omit<StrategyDecision, "id" | "evidenceMemoryIds"> & { evidenceMemoryIds?: string[] }): Promise<StrategyDecision>; }

export class ClosedLoopLearningEngine {
  constructor(private readonly memory: LearningMemoryPort, private readonly strategy: StrategyPort) {}

  async ingest(signal: PerformanceSignal): Promise<{ memories: LearningMemory[]; decision: StrategyDecision }> {
    const impressions = signal.metrics.impressions ?? 0;
    const clicks = signal.metrics.clicks ?? 0;
    const conversions = signal.metrics.conversions ?? 0;
    const ctr = impressions > 0 ? clicks / impressions : 0;
    const cvr = clicks > 0 ? conversions / clicks : 0;
    const category: LearningCategory = conversions > 0 ? "winner" : ctr > 0 ? "optimization" : "weakness";
    const confidence = Math.min(0.95, 0.35 + Math.log10(Math.max(1, impressions)) / 10);
    const statement = `Subject ${signal.subject}: CTR=${ctr.toFixed(4)}, CVR=${cvr.toFixed(4)}, conversions=${conversions}.`;
    const memories = await this.memory.persist([{ sourceId: signal.id, category, statement, confidence, tags: [signal.subject, category] }]);
    const recommendations = category === "winner"
      ? ["Preserve the winning pattern", "Create controlled variations", "Test scale without changing the core mechanism"]
      : category === "optimization"
        ? ["Keep the hook pattern", "Test stronger offer and CTA variants", "Compare audience and placement segments"]
        : ["Do not scale this pattern", "Test a materially different angle", "Investigate audience-message fit"];
    const decision = await this.strategy.createDecision({ id: `decision:${signal.id}`, objective: `Improve future creative performance for ${signal.subject}`, context: { signalId: signal.id, ctr, cvr, conversions }, constraints: ["Use evidence-backed changes", "Keep experiments controlled"], recommendations, evidenceMemoryIds: memories.map((m) => m.id) });
    return { memories, decision };
  }

  async enrichStrategy(query: string, objective: string) {
    const memories = await this.memory.retrieve(query, 8);
    return this.strategy.createDecision({ id: `decision:memory:${Date.now()}`, objective, context: { query }, constraints: ["Treat memory as evidence, not certainty"], recommendations: memories.map((m) => m.statement), evidenceMemoryIds: memories.map((m) => m.id) });
  }
}
