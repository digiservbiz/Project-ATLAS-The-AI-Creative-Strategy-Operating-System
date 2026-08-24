import type { CreativeMetrics, MetricsSnapshot } from "@atlas/analytics";

export interface LearningSignal {
  id: string;
  campaignId: string;
  sourceMetricId: string;
  category: "winner" | "weakness" | "optimization";
  signal: string;
  value?: number;
  confidence: number;
  createdAt: string;
}

export function metricsToLearningSignals(snapshot: MetricsSnapshot): LearningSignal[] {
  const m: CreativeMetrics = snapshot.metrics;
  const signals: LearningSignal[] = [];
  const base = { campaignId: snapshot.campaignId, sourceMetricId: snapshot.id, createdAt: new Date().toISOString() };
  if (m.roas !== undefined) signals.push({ ...base, id: `${snapshot.id}:roas`, category: m.roas >= 2 ? "winner" : "weakness", signal: `ROAS=${m.roas}`, value: m.roas, confidence: Math.min(0.99, 0.5 + Math.abs(m.roas - 1) / 4) });
  if (m.ctr !== undefined) signals.push({ ...base, id: `${snapshot.id}:ctr`, category: m.ctr >= 0.02 ? "winner" : "optimization", signal: `CTR=${m.ctr}`, value: m.ctr, confidence: 0.7 });
  if (m.cpa !== undefined) signals.push({ ...base, id: `${snapshot.id}:cpa`, category: "optimization", signal: `CPA=${m.cpa}`, value: m.cpa, confidence: 0.65 });
  if (m.conversions !== undefined && m.conversions > 0) signals.push({ ...base, id: `${snapshot.id}:conversion`, category: "winner", signal: `Conversions=${m.conversions}`, value: m.conversions, confidence: 0.75 });
  return signals;
}
