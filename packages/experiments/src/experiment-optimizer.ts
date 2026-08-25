export interface ExperimentVariant { id: string; metric: number; spend: number; conversions: number; confidence: number; }
export interface OptimizationDecision { winnerId?: string; action: "scale" | "continue" | "stop"; allocation: Record<string, number>; rationale: string; }

export class ExperimentOptimizer {
  decide(variants: ExperimentVariant[], totalBudget: number): OptimizationDecision {
    if (!variants.length || totalBudget <= 0) return { action: "stop", allocation: {}, rationale: "No eligible variants or budget." };
    const ranked = [...variants].sort((a, b) => (b.metric * b.confidence) - (a.metric * a.confidence));
    const winner = ranked[0];
    const totalScore = ranked.reduce((sum, v) => sum + Math.max(0.01, v.metric * Math.max(0.1, v.confidence)), 0);
    const allocation = Object.fromEntries(ranked.map((v) => [v.id, totalBudget * Math.max(0.01, v.metric * Math.max(0.1, v.confidence)) / totalScore]));
    return { winnerId: winner.id, action: winner.confidence >= 0.75 && winner.conversions >= 3 ? "scale" : "continue", allocation, rationale: `Ranked ${ranked.length} variants by confidence-adjusted metric.` };
  }
}
