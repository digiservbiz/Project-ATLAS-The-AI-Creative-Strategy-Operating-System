import type { MetricsSnapshot, MetricsStore } from "@atlas/analytics";
import { MetricsClosedLoop } from "@atlas/learning";
import type { PlatformMetricRecord } from "./platform-metrics";
import { PlatformMetricsToCanonicalService } from "./platform-metrics-mapper";

export class PlatformMetricsLearningIngestion {
  constructor(private readonly mapper: PlatformMetricsToCanonicalService, private readonly metricsStore: MetricsStore, private readonly learning: MetricsClosedLoop) {}

  async ingest(records: PlatformMetricRecord[]): Promise<{ snapshots: MetricsSnapshot[]; learningResults: Awaited<ReturnType<MetricsClosedLoop["ingest"]>>[] }> {
    const snapshots = await this.mapper.map(records);
    const learningResults = [];
    for (const snapshot of snapshots) {
      await this.metricsStore.save(snapshot);
      learningResults.push(await this.learning.ingest(snapshot));
    }
    return { snapshots, learningResults };
  }
}
