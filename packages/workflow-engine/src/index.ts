import type { ExecutionEnvelope } from "@atlas/contracts";
import type { AgentRuntime, AgentResult } from "@atlas/agent-runtime";

export interface WorkflowStep {
  stepId: string;
  agentId: string;
  agentVersion: string;
  input: ExecutionEnvelope;
}

export interface WorkflowRunResult {
  status: "completed" | "needs_review" | "blocked" | "failed";
  completedSteps: string[];
  outputs: Record<string, AgentResult>;
}

export class WorkflowEngine {
  constructor(private readonly runtime: AgentRuntime) {}

  async run(steps: readonly WorkflowStep[]): Promise<WorkflowRunResult> {
    const outputs: Record<string, AgentResult> = {};
    const completedSteps: string[] = [];

    for (const step of steps) {
      const result = await this.runtime.execute(step.input);
      outputs[step.stepId] = result;

      if (result.status !== "completed") {
        return {
          status: result.status,
          completedSteps,
          outputs,
        };
      }

      completedSteps.push(step.stepId);
    }

    return { status: "completed", completedSteps, outputs };
  }
}
