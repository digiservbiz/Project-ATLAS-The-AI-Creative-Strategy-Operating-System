import type { Pattern } from "./cross-campaign-patterns";

export interface StrategyDecision { id: string; category: string; action: "scale" | "test" | "deprioritize"; rationale: string; confidence: number; createdAt: string; }

export class StrategyDecisionEngine {
  generate(patterns: Pattern[]): StrategyDecision[] {
    return patterns.map((pattern, index) => {
      const confidence = Math.min(0.99, Math.max(0.1, pattern.averageConfidence * Math.min(1, pattern.sampleCount / 5)));
      const action = pattern.averageValue >= 1 ? "scale" : pattern.averageValue <= 0 ? "deprioritize" : "test";
      return { id: `decision-${Date.now()}-${index}`, category: pattern.category, action, rationale: `${pattern.sampleCount} campaign signals support ${action} for ${pattern.category}.`, confidence, createdAt: new Date().toISOString() };
    });
  }
}
