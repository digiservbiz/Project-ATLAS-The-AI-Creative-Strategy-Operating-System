import type { PerformanceEvent } from "./performance-ingestion";

export interface LearningInsight { id: string; subject: string; observation: string; evidenceEventIds: string[]; confidence: number; recommendation: string; createdAt: string; }
export interface LearningStore { save(insights: LearningInsight[]): Promise<void>; }

export class LearningEngine {
  constructor(private readonly store: LearningStore) {}

  async learn(events: PerformanceEvent[]): Promise<LearningInsight[]> {
    const groups = new Map<string, PerformanceEvent[]>();
    for (const event of events) {
      const key = event.creativeId ?? event.contentId ?? event.campaignId;
      if (!key) continue;
      const group = groups.get(key) ?? [];
      group.push(event); groups.set(key, group);
    }
    const insights: LearningInsight[] = [];
    for (const [subject, group] of groups) {
      const impressions = group.reduce((n, e) => n + (e.metrics.impressions ?? 0), 0);
      const clicks = group.reduce((n, e) => n + (e.metrics.clicks ?? 0), 0);
      const conversions = group.reduce((n, e) => n + (e.metrics.conversions ?? 0), 0);
      const ctr = impressions ? clicks / impressions : 0;
      const cvr = clicks ? conversions / clicks : 0;
      const recommendation = conversions > 0 ? "Preserve the successful creative pattern and test controlled variations." : ctr > 0 ? "Retain the hook pattern and test stronger offer/CTA variants." : "Do not scale yet; test a materially different angle or hook.";
      insights.push({ id: `learning:${subject}:${Date.now()}`, subject, observation: `CTR=${ctr.toFixed(4)}, CVR=${cvr.toFixed(4)}, conversions=${conversions}`, evidenceEventIds: group.map((e) => e.id), confidence: Math.min(0.95, 0.35 + Math.log10(Math.max(1, impressions)) / 10), recommendation, createdAt: new Date().toISOString() });
    }
    await this.store.save(insights);
    return insights;
  }
}
