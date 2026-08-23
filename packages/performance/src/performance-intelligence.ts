export interface PerformanceMetric { entityId: string; entityType: "campaign" | "creative" | "ad"; impressions: number; clicks: number; spend: number; conversions: number; revenue?: number; timestamp: string; metadata?: Record<string, unknown>; }
export interface PerformanceInsight { entityId: string; score: number; classification: "winner" | "promising" | "underperforming" | "insufficient_data"; reasons: string[]; recommendations: string[]; }

export class PerformanceIntelligence {
  analyze(metrics: PerformanceMetric[]): PerformanceInsight[] {
    return metrics.map((metric) => {
      if (metric.impressions < 100) return { entityId: metric.entityId, score: 0, classification: "insufficient_data", reasons: ["Not enough impressions"], recommendations: ["Collect more data before making a decision"] };
      const ctr = metric.clicks / metric.impressions;
      const cvr = metric.clicks ? metric.conversions / metric.clicks : 0;
      const roas = metric.revenue !== undefined && metric.spend > 0 ? metric.revenue / metric.spend : undefined;
      const score = Math.min(1, ctr * 4 + cvr * 4 + (roas === undefined ? 0 : Math.min(roas / 4, 1) * 0.2));
      const classification = score >= 0.7 ? "winner" : score >= 0.4 ? "promising" : "underperforming";
      const reasons = [`CTR ${(ctr * 100).toFixed(2)}%`, `CVR ${(cvr * 100).toFixed(2)}%`, ...(roas === undefined ? [] : [`ROAS ${roas.toFixed(2)}`])];
      const recommendations = classification === "winner" ? ["Preserve the winning angle", "Generate controlled creative variations"] : classification === "underperforming" ? ["Review hook and audience fit", "Test a new creative angle"] : ["Continue testing and collect more evidence"];
      return { entityId: metric.entityId, score, classification, reasons, recommendations };
    });
  }
}
