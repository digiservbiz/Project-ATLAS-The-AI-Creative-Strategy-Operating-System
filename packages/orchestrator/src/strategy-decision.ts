import type { AgentContext } from "./types";
import type { StrategyContext } from "./strategy-context";

export interface StrategyDecision {
  decisionId: string;
  organizationId: string;
  objective: string;
  rationale: string;
  evidence: Array<{ key: string; score: number; reason: string }>;
  confidence: number;
  createdAt: string;
}

export class StrategyDecisionBuilder {
  build(context: AgentContext, strategy: StrategyContext): StrategyDecision {
    const evidence = strategy.historicalEvidence.map((hit) => ({
      key: hit.key,
      score: hit.score,
      reason: "Retrieved as semantically relevant historical performance evidence",
    }));
    const confidence = evidence.length === 0 ? 0.25 : Math.min(0.95, 0.5 + evidence.reduce((sum, item) => sum + item.score, 0) / evidence.length / 2);
    return {
      decisionId: `strategy:${context.organizationId}:${Date.now()}`,
      organizationId: context.organizationId,
      objective: strategy.request.objective,
      rationale: evidence.length ? "Strategy is informed by semantically retrieved historical campaign evidence." : "No relevant historical evidence was retrieved; strategy requires conservative exploration.",
      evidence,
      confidence,
      createdAt: new Date().toISOString(),
    };
  }
}
