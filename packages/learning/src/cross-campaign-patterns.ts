export interface CampaignSignal { campaignId: string; category: string; value: number; confidence: number; }
export interface Pattern { category: string; sampleCount: number; averageValue: number; averageConfidence: number; campaignIds: string[]; }

export function aggregatePatterns(signals: CampaignSignal[]): Pattern[] {
  const groups = new Map<string, CampaignSignal[]>();
  for (const signal of signals) groups.set(signal.category, [...(groups.get(signal.category) ?? []), signal]);
  return [...groups.entries()].map(([category, rows]) => ({
    category,
    sampleCount: rows.length,
    averageValue: rows.reduce((s, r) => s + r.value, 0) / rows.length,
    averageConfidence: rows.reduce((s, r) => s + r.confidence, 0) / rows.length,
    campaignIds: [...new Set(rows.map((r) => r.campaignId))],
  }));
}
