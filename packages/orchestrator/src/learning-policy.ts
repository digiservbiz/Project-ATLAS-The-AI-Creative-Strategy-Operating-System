import type { AgentContext } from "./contracts";
import type { AgentMemoryStore } from "./memory";

export interface LearningRecommendation {
  campaignId: string;
  recommendation: string;
  confidence: number;
}

export class LearningPolicy {
  constructor(private readonly memory: AgentMemoryStore) {}

  async recommend(context: AgentContext, campaignId: string): Promise<LearningRecommendation[]> {
    const records = await this.memory.list(context.organizationId, "campaign-performance", context.projectId);
    const relevant = records.filter((record) => {
      const value = record.value as { record?: { campaignId?: string }; insight?: { direction?: string } };
      return value.record?.campaignId === campaignId;
    });

    if (!relevant.length) return [];

    const latest = relevant.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    const value = latest.value as { insight?: { direction?: string; score?: number; recommendations?: string[] } };
    const insight = value.insight;
    if (!insight) return [];

    return (insight.recommendations ?? []).map((recommendation) => ({
      campaignId,
      recommendation,
      confidence: Math.max(0, Math.min(1, insight.score ?? 0.5)),
    }));
  }
}
