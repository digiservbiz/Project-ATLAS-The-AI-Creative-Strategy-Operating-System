import type { StrategyDecision } from "./strategy-decision-engine";

export interface DecisionMemoryWriter { save(input: { id: string; category: string; content: string; confidence: number; metadata: Record<string, unknown> }): Promise<void>; }

export class DecisionMemoryBridge {
  constructor(private readonly memory: DecisionMemoryWriter) {}

  async persist(decisions: StrategyDecision[], campaignId?: string) {
    for (const decision of decisions) {
      await this.memory.save({
        id: `decision-memory:${decision.id}`,
        category: decision.category,
        content: decision.rationale,
        confidence: decision.confidence,
        metadata: { decisionId: decision.id, action: decision.action, campaignId, createdAt: decision.createdAt },
      });
    }
    return decisions.length;
  }
}
