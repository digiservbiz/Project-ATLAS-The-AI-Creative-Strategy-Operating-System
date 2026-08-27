import type { CanonicalMetrics } from "./canonical-metrics";

export interface MetricsRepository { save(metrics: CanonicalMetrics): Promise<void>; listByCampaign(campaignId: string, limit?: number): Promise<CanonicalMetrics[]>; }
export interface LearningRepository { save(signal: LearningSignal): Promise<void>; listByCampaign(campaignId: string, limit?: number): Promise<LearningSignal[]>; }
export interface LearningSignal { id: string; campaignId?: string; creativeId?: string; platform: CanonicalMetrics["platform"]; metricSnapshot: Pick<CanonicalMetrics, "impressions" | "clicks" | "spend" | "conversions" | "revenue" | "ctr" | "cpc" | "cpa" | "roas">; insight: string; confidence: number; createdAt: string; }

export class InMemoryMetricsRepository implements MetricsRepository {
  private readonly items: CanonicalMetrics[] = [];
  async save(metrics: CanonicalMetrics) { this.items.push(metrics); }
  async listByCampaign(campaignId: string, limit = 100) { return this.items.filter(x => x.campaignId === campaignId).slice(-limit); }
}

export class InMemoryLearningRepository implements LearningRepository {
  private readonly items: LearningSignal[] = [];
  async save(signal: LearningSignal) { this.items.push(signal); }
  async listByCampaign(campaignId: string, limit = 100) { return this.items.filter(x => x.campaignId === campaignId).slice(-limit); }
}

export class MetricsLearningBridge {
  constructor(private readonly metricsRepo: MetricsRepository, private readonly learningRepo: LearningRepository) {}
  async record(metrics: CanonicalMetrics): Promise<LearningSignal> {
    await this.metricsRepo.save(metrics);
    const confidence = Math.min(0.99, Math.max(0.1, Math.log10(1 + metrics.impressions) / 6 + (metrics.conversions > 0 ? 0.25 : 0)));
    const insight = metrics.roas >= 2 ? "Positive return signal: preserve the creative pattern and test controlled variations." : metrics.conversions > 0 ? "Conversion signal detected: continue testing while improving efficiency." : "Insufficient conversion evidence: collect more data before scaling.";
    const signal: LearningSignal = {
      id: `${metrics.platform}:${metrics.externalId}:${metrics.collectedAt}`,
      campaignId: metrics.campaignId,
      creativeId: metrics.creativeId,
      platform: metrics.platform,
      metricSnapshot: metrics,
      insight,
      confidence,
      createdAt: new Date().toISOString(),
    };
    await this.learningRepo.save(signal);
    return signal;
  }
}
