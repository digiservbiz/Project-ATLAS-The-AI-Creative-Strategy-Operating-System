import type { Experiment, ExperimentEngine, ExperimentMetrics } from "./experiment-engine";

export interface ExperimentLearningSignal { experimentId: string; winnerVariantId?: string; confidence: number; recommendation: string; }

export class ExperimentLearningBridge {
  constructor(private readonly engine: ExperimentEngine) {}
  async learn(experiment: Experiment, metrics: ExperimentMetrics[]): Promise<ExperimentLearningSignal> {
    const result = await this.engine.evaluate(experiment.id, metrics);
    return { experimentId: experiment.id, winnerVariantId: result.winner?.variantId, confidence: result.confidence, recommendation: result.recommendation };
  }
}
