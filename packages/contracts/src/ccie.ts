export type CreativeSource = "meta_ad_library" | "tiktok_creative_center" | "tiktok_commercial_content" | "authorized_custom";

export interface CreativeEvidence {
  source: CreativeSource;
  sourceId: string;
  sourceUrl?: string;
  capturedAt: string;
  advertiserName?: string;
  market?: string;
  platform?: "meta" | "tiktok" | "google" | "other";
  isPublicPerformanceData?: boolean;
}

export interface CreativeArtifact {
  id: string;
  organizationId: string;
  source: CreativeEvidence;
  title?: string;
  primaryText?: string;
  headline?: string;
  description?: string;
  callToAction?: string;
  landingPageUrl?: string;
  mediaUrls?: string[];
  language?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreativeIngestionQuery {
  organizationId: string;
  market?: string;
  advertiser?: string;
  query?: string;
  platform?: CreativeEvidence["platform"];
  source?: CreativeSource;
  limit?: number;
}

export interface CreativeSourceAdapter {
  readonly source: CreativeSource;
  search(query: CreativeIngestionQuery): Promise<CreativeArtifact[]>;
}

export interface CreativeIntelligenceInsight {
  concept: string;
  evidenceIds: string[];
  confidence: number;
  caveats: string[];
  observedPatterns: string[];
}
