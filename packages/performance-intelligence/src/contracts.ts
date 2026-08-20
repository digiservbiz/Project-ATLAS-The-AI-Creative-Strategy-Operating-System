export type MetricName = "impressions" | "clicks" | "spend" | "conversions" | "revenue" | "ctr" | "cpc" | "cpm" | "cpa" | "roas";

export interface CampaignMetricSnapshot {
  organizationId: string;
  platform: "meta" | "tiktok" | "google" | "pinterest" | "snapchat";
  campaignId: string;
  adId?: string;
  timestamp: string;
  impressions?: number;
  clicks?: number;
  spend?: number;
  conversions?: number;
  revenue?: number;
}

export interface DerivedMetrics {
  ctr?: number;
  cpc?: number;
  cpm?: number;
  cpa?: number;
  roas?: number;
}

export interface CampaignPerformanceRecord extends CampaignMetricSnapshot {
  derived: DerivedMetrics;
}

export interface PerformanceInsight {
  campaignId: string;
  score: number;
  direction: "positive" | "negative" | "neutral";
  findings: string[];
  recommendations: string[];
}
