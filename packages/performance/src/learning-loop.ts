import type { PerformanceInsight } from "./performance-intelligence";

export interface LearningSignal { sourceId: string; type: "winning_angle" | "weak_angle" | "audience_signal" | "optimization"; statement: string; confidence: number; }

export class LearningLoop {
  derive(insights: PerformanceInsight[]): LearningSignal[] {
    return insights.flatMap((insight) => {
      if (insight.classification === "insufficient_data") return [];
      const signals: LearningSignal[] = [];
      if (insight.classification === "winner") signals.push({ sourceId: insight.entityId, type: "winning_angle", statement: "Preserve the current creative/positioning pattern and generate controlled variations.", confidence: Math.min(0.95, 0.7 + insight.score * 0.25) });
      if (insight.classification === "underperforming") signals.push({ sourceId: insight.entityId, type: "weak_angle", statement: "Reduce reliance on the current pattern and test a materially different hook or audience.", confidence: Math.min(0.9, 0.6 + (1 - insight.score) * 0.25) });
      for (const recommendation of insight.recommendations) signals.push({ sourceId: insight.entityId, type: "optimization", statement: recommendation, confidence: insight.score });
      return signals;
    });
  }
}
