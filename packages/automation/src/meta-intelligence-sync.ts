import type {
  IntelligenceSnapshot,
  LearningRecord,
  PlatformPerformanceInput,
} from "@atlas/intelligence";
import type { MetaInsightsRequest } from "./meta-insights-client";
import { MetaPerformanceSync } from "./meta-performance-sync";
import type { MetaAdsInsightsRow, MetaPerformanceAdapterContext } from "./meta-performance-adapter";
import {
  PerformanceIntelligenceIngestion,
  type PerformanceIntelligenceIngestionResult,
} from "./performance-intelligence-ingestion";

export interface MetaIntelligenceSyncResult {
  rows: MetaAdsInsightsRow[];
  inputs: PlatformPerformanceInput[];
  results: PerformanceIntelligenceIngestionResult[];
  learnings: LearningRecord[];
  snapshot: IntelligenceSnapshot;
}

/**
 * End-to-end Meta performance learning boundary.
 *
 * Meta Insights -> canonical performance -> Creative DNA -> learning loop ->
 * refreshed Intelligence Snapshot. The snapshot is advanced after every
 * qualifying learning so multiple creatives are evaluated against the latest
 * strategic state in one sync run.
 */
export class MetaIntelligenceSync {
  constructor(
    private readonly performanceSync: MetaPerformanceSync,
    private readonly ingestion: PerformanceIntelligenceIngestion,
  ) {}

  async sync(
    request: MetaInsightsRequest,
    context: MetaPerformanceAdapterContext,
    snapshot: IntelligenceSnapshot,
  ): Promise<MetaIntelligenceSyncResult> {
    if (snapshot.state.businessId !== context.businessId) {
      throw new Error("Meta intelligence sync business scope mismatch");
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
