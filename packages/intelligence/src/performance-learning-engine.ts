import type { CreativeDNA } from "./creative-dna";
import type { LearningRecord } from "./learning-loop";

export interface CanonicalPerformanceMetrics {
  creativeId: string;
  businessId: string;
  platform: string;
  period: { start: string; end: string };
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  evidenceIds: string[];
}

export interface PlatformPerformanceInput {
  creativeId: string;
  businessId: string;
  platform: string;
  period: { start: string; end: string };
  impressions?: number;
  clicks?: number;
  spend?: number;
  conversions?: number;
  revenue?: number;
  metrics?: Record<string, number | undefined>;
  evidenceIds?: string[];
}

export interface PerformanceLearningThresholds {
  minImpressions: number;
  minClicks: number;
  minConversions: number;
  strongRoas: number;
  weakRoas: number;
  strongCtr: number;
  weakCtr: number;
}

export interface PerformanceLearningResult {
  creative: CreativeDNA;
  learning: LearningRecord | null;
}

const DEFAULT_THRESHOLDS: PerformanceLearningThresholds = {
  minImpressions: 100,
  minClicks: 10,
  minConversions: 1,
  strongRoas: 3,
  weakRoas: 1,
  strongCtr: 0.03,
  weakCtr: 0.01,
};

function finite(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function nonNegative(value: unknown, name: string): number {
  const result = finite(value);
  if (result < 0) throw new Error(`${name} cannot be negative`);
  return result;
}

function metric(input: PlatformPerformanceInput, key: string, aliases: string[]): number {
  const direct = (input as unknown as Record<string, unknown>)[key];
  if (direct !== undefined) return finite(direct);
  for (const alias of aliases) {
    const value = input.metrics?.[alias];
    if (value !== undefined) return finite(value);
  }
  return 0;
}

export function normalizePerformance(input: PlatformPerformanceInput): CanonicalPerformanceMetrics {
  if (!input.creativeId.trim()) throw new Error("Creative ID is required");
  if (!input.businessId.trim()) throw new Error("Business ID is required");
  if (!input.platform.trim()) throw new Error("Performance platform is required");

  const impressions = nonNegative(metric(input, "impressions", ["impressions", "views"]), "Impressions");
  const clicks = nonNegative(metric(input, "clicks", ["clicks", "link_clicks"]), "Clicks");
  const spend = nonNegative(metric(input, "spend", ["spend", "cost"]), "Spend");
  const conversions = nonNegative(metric(input, "conversions", ["conversions", "purchases", "leads"]), "Conversions");
  const revenue = nonNegative(metric(input, "revenue", ["revenue", "conversion_value", "purchase_value"]), "Revenue");

  return {
    creativeId: input.creativeId,
    businessId: input.businessId,
    platform: input.platform,
    period: { ...input.period },
    impressions,
    clicks,
    spend,
    conversions,
    revenue,
    ctr: impressions > 0 ? clicks / impressions : 0,
    cpc: clicks > 0 ? spend / clicks : 0,
    cpa: conversions > 0 ? spend / conversions : 0,
    roas: spend > 0 ? revenue / spend : 0,
    evidenceIds: [...new Set(input.evidenceIds ?? [])],
  };
}

export function applyPerformanceToCreativeDNA(
  dna: CreativeDNA,
  performance: CanonicalPerformanceMetrics,
): CreativeDNA {
  if (dna.id !== performance.creativeId) throw new Error("Creative performance ID mismatch");
  if (dna.businessId !== performance.businessId) throw new Error("Creative performance business scope mismatch");

  return {
    ...structuredClone(dna),
    performance: {
      impressions: performance.impressions,
      clicks: performance.clicks,
      spend: performance.spend,
      conversions: performance.conversions,
      revenue: performance.revenue,
      ctr: performance.ctr,
      cpc: performance.cpc,
      cpa: performance.cpa,
      roas: performance.roas,
    },
    evidenceIds: [...new Set([...dna.evidenceIds, ...performance.evidenceIds])],
  };
}

export function createPerformanceLearning(
  dna: CreativeDNA,
  performance: CanonicalPerformanceMetrics,
  thresholds: Partial<PerformanceLearningThresholds> = {},
): LearningRecord | null {
  if (dna.id !== performance.creativeId) throw new Error("Creative performance ID mismatch");
  if (dna.businessId !== performance.businessId) throw new Error("Creative performance business scope mismatch");

  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const enoughData = performance.impressions >= t.minImpressions &&
    performance.clicks >= t.minClicks &&
    performance.conversions >= t.minConversions;
  if (!enoughData) return null;

  const strong = performance.roas >= t.strongRoas && performance.ctr >= t.strongCtr;
  const weak = performance.roas <= t.weakRoas && performance.ctr <= t.weakCtr;
  if (!strong && !weak) return null;

  const status = strong ? "supported" : "rejected";
  const hypothesisId = `creative-performance:${dna.id}`;
  const statement = strong
    ? `Creative ${dna.id} supports its current hook/angle combination with ${performance.roas.toFixed(2)} ROAS and ${(performance.ctr * 100).toFixed(2)}% CTR on ${performance.platform}.`
    : `Creative ${dna.id} underperforms on its current hook/angle combination with ${performance.roas.toFixed(2)} ROAS and ${(performance.ctr * 100).toFixed(2)}% CTR on ${performance.platform}.`;

  return {
    id: `learning:performance:${dna.id}:${performance.period.start}:${performance.period.end}`,
    businessId: performance.businessId,
    statement,
    evidenceIds: [...new Set([...performance.evidenceIds, `performance:${dna.id}:${performance.period.start}:${performance.period.end}`])],
    sampleSize: performance.impressions,
    confidence: Math.min(1, Math.max(0, Math.min(
      performance.impressions / (t.minImpressions * 10),
      performance.clicks / (t.minClicks * 10),
      performance.conversions / (t.minConversions * 10),
    ))),
    scope: { platform: performance.platform, period: performance.period },
    hypothesisId,
    status,
    createdAt: new Date().toISOString(),
  };
}

export function processPerformanceOutcome(
  dna: CreativeDNA,
  input: PlatformPerformanceInput,
  thresholds: Partial<PerformanceLearningThresholds> = {},
): PerformanceLearningResult {
  const performance = normalizePerformance(input);
  const creative = applyPerformanceToCreativeDNA(dna, performance);
  return { creative, learning: createPerformanceLearning(creative, performance, thresholds) };
}
