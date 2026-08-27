import type { Experiment, ExperimentMetrics } from "./experiment-engine";
import { ExperimentLearningBridge } from "./experiment-learning-bridge";

export interface VariantMetricResolver { resolve(experiment: Experiment, input: { externalId: string; metrics: Record<string, number>; }): Promise<ExperimentMetrics | null>; }
export interface LearningSignalSink { publish(signal: { experimentId: string; winnerVariantId?: string; confidence: number; recommendation: string }): Promise<void>; }

export class ExperimentMetricsLearningPipeline {
  constructor(private readonly resolver: VariantMetricResolver, private readonly bridge: ExperimentLearningBridge, private readonly sink: LearningSignalSink) {}

  async ingest(experiment: Experiment, records: Array<{ externalId: string; metrics: Record<string, number> }>) {
    const metrics: ExperimentMetrics[] = [];
    for (const record of records) {
      const resolved = await this.resolver.resolve(experiment, record);
      if (resolved) metrics.push(resolved);
    }
    if (!metrics.length) return null;
    const signal = await this.bridge.learn(experiment, metrics);
    await this.sink.publish(signal);
    return signal;
  }
}
