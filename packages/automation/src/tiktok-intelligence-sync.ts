import type { IntelligenceSnapshot, LearningRecord, PlatformPerformanceInput } from "@atlas/intelligence";
import { TikTokPerformanceSync } from "./tiktok-performance-sync";
import type { TikTokInsightsRequest } from "./tiktok-ads-client";
import type { TikTokAdsInsightsRow, TikTokPerformanceAdapterContext } from "./tiktok-performance-adapter";
import { PerformanceIntelligenceIngestion, type PerformanceIntelligenceIngestionResult } from "./performance-intelligence-ingestion";

export interface TikTokIntelligenceSyncResult {
  rows: TikTokAdsInsightsRow[];
  inputs: PlatformPerformanceInput[];
  results: PerformanceIntelligenceIngestionResult[];
  learnings: LearningRecord[];
  snapshot: IntelligenceSnapshot;
}

export class TikTokIntelligenceSync {
  constructor(
    private readonly performanceSync: TikTokPerformanceSync,
    private readonly ingestion: PerformanceIntelligenceIngestion,
  ) {}

  async sync(
    request: TikTokInsightsRequest,
    context: TikTokPerformanceAdapterContext,
    snapshot: IntelligenceSnapshot,
  ): Promise<TikTokIntelligenceSyncResult> {
    if (snapshot.state.businessId !== context.businessId) {
      throw new Error("TikTok intelligence sync business scope mismatch");
    }

    const collected = await this.performanceSync.collect(request, context);
    let currentSnapshot = snapshot;
    const results: PerformanceIntelligenceIngestionResult[] = [];

    for (const input of collected.inputs) {
      const result = await this.ingestion.process(input, currentSnapshot);
      results.push(result);
      currentSnapshot = result.snapshot;
    }

    return {
      rows: collected.rows,
      inputs: collected.inputs,
      results,
      learnings: results.flatMap((result) => result.learning ? [result.learning] : []),
      snapshot: currentSnapshot,
    };
  }
}
