import type { PlatformPerformanceInput } from "@atlas/intelligence";
import { TikTokAdsClient, type TikTokInsightsRequest } from "./tiktok-ads-client";
import { mapTikTokAdsInsightsBatch, type TikTokAdsInsightsRow, type TikTokPerformanceAdapterContext } from "./tiktok-performance-adapter";

export interface TikTokPerformanceSyncResult {
  rows: TikTokAdsInsightsRow[];
  inputs: PlatformPerformanceInput[];
}

export class TikTokPerformanceSync {
  constructor(private readonly client: TikTokAdsClient) {}

  async collect(
    request: TikTokInsightsRequest,
    context: TikTokPerformanceAdapterContext,
  ): Promise<TikTokPerformanceSyncResult> {
    const page = await this.client.fetch(request);
    const rows = page.data ?? [];
    return { rows, inputs: mapTikTokAdsInsightsBatch(rows, context) };
  }
}
