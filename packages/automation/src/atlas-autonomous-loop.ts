import type { IntelligenceSnapshot, PlatformPerformanceInput } from "@atlas/intelligence";
import { AtlasOperatingLoop, type AtlasOperatingLoopInput, type AtlasOperatingLoopResult } from "./atlas-operating-loop";

export type AutonomousStopReason = "max_iterations" | "awaiting_approval" | "no_actionable_progress" | "completed";

export interface AtlasAutonomousLoopOptions {
  maxIterations?: number;
  nextPerformance?: (result: AtlasOperatingLoopResult, iteration: number) => Promise<PlatformPerformanceInput | undefined>;
}

export interface AtlasAutonomousLoopResult {
  iterations: AtlasOperatingLoopResult[];
  finalSnapshot: IntelligenceSnapshot;
  stopReason: AutonomousStopReason;
}

/** Bounded ATLAS control loop: execute, learn from performance, re-evaluate, repeat. */
export class AtlasAutonomousLoop {
  constructor(private readonly operatingLoop: AtlasOperatingLoop) {}

  async run(input: AtlasOperatingLoopInput, options: AtlasAutonomousLoopOptions = {}): Promise<AtlasAutonomousLoopResult> {
    const maxIterations = Math.max(1, Math.min(20, Math.floor(options.maxIterations ?? 3)));
    const iterations: AtlasOperatingLoopResult[] = [];
    let current: AtlasOperatingLoopInput = { ...input };

    for (let iteration = 0; iteration < maxIterations; iteration += 1) {
      const result = await this.operatingLoop.run({ ...current, runId: `${input.runId}:${iteration + 1}` });
      iterations.push(result);

      const awaitingApproval = Object.values(result.workflow.outputs).some((output) => output.requiresApproval === true);
      if (awaitingApproval) return { iterations, finalSnapshot: result.nextSnapshot, stopReason: "awaiting_approval" };
      if (iteration === maxIterations - 1) return { iterations, finalSnapshot: result.nextSnapshot, stopReason: "max_iterations" };

      const performance = options.nextPerformance
        ? await options.nextPerformance(result, iteration + 1)
        : undefined;
      if (!performance) return { iterations, finalSnapshot: result.nextSnapshot, stopReason: "completed" };

      const previousAction = result.decision.actionId ?? result.decision.workflow;
      const nextAction = result.nextDecision.actionId ?? result.nextDecision.workflow;
      if (previousAction === nextAction && !result.performance) {
        return { iterations, finalSnapshot: result.nextSnapshot, stopReason: "no_actionable_progress" };
      }

      current = { ...current, snapshot: result.nextSnapshot, performance };
    }

    return { iterations, finalSnapshot: current.snapshot, stopReason: "max_iterations" };
  }
}
