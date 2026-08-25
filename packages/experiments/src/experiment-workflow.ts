import type { ExperimentOptimizer, ExperimentVariant, OptimizationDecision } from "./experiment-optimizer";

export interface ExperimentControl { getVariants(experimentId: string): Promise<ExperimentVariant[]>; apply(experimentId: string, decision: OptimizationDecision): Promise<void>; }

export class ExperimentOptimizationWorkflow {
  constructor(private readonly optimizer: ExperimentOptimizer, private readonly control: ExperimentControl) {}

  async optimize(experimentId: string, budget: number) {
    const variants = await this.control.getVariants(experimentId);
    const decision = this.optimizer.decide(variants, budget);
    await this.control.apply(experimentId, decision);
    return decision;
  }
}
