import type { PlatformPerformanceInput } from "@atlas/intelligence";
import type { MetaInsightsClient, MetaInsightsRequest, MetaAdsInsightsPage } from "./meta-insights-client";
import { mapMetaAdsInsightsBatch, type MetaAdsInsightsRow, type MetaPerformanceAdapterContext } from "./meta-performance-adapter";

export interface MetaPerformanceSyncResult {
  rows: MetaAdsInsightsRow[];
  inputs: PlatformPerformanceInput[];
}

/** Fetches Meta Insights and converts provider rows into ATLAS's canonical performance contract. */
export class MetaPerformanceSync {
  constructor(private readonly client: MetaInsightsClient) {}

  async collect(
    request: MetaInsightsRequest,
    context: MetaPerformanceAdapterContext,
  ): Promise<MetaPerformanceSyncResult> {
    const page = await this.client.fetch(request) as MetaAdsInsightsPage<MetaAdsInsightsRow>;
    const rows = page.data ?? [];
    return {
      rows,
      inputs: mapMetaAdsInsightsBatch(rows, context),
    };
  }
}
