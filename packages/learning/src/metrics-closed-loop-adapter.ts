import type { MetricsSnapshot } from "@atlas/analytics";
import { ClosedLoopLearningEngine, type PerformanceSignal } from "./closed-loop-learning";
import { metricsToLearningSignals } from "./metrics-learning-bridge";

export class MetricsClosedLoopAdapter {
  constructor(private readonly engine: ClosedLoopLearningEngine) {}

  async ingest(snapshot: MetricsSnapshot) {
    const signals = metricsToLearningSignals(snapshot);
    const results = [];
    for (const signal of signals) {
      const performance: PerformanceSignal = {
        id: signal.id,
        subject: snapshot.creativeId ?? snapshot.campaignId,
        metrics: snapshot.metrics as Record<string, number>,
        evidence: [snapshot.id],
      };
      results.push(await this.engine.ingest(performance));
    }
    return results;
  }
}
