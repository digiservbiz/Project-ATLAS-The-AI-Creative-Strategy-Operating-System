import type { ExecutionEnvelope } from "@atlas/contracts";
import type { AgentResult, AgentRuntime } from "@atlas/agent-runtime";

export interface WorkflowStore {
  createRun(input: { runId: string; workflowName: string; input: Record<string, unknown> }): Promise<void>;
  markRun(runId: string, status: "running" | "completed" | "failed" | "needs_review" | "blocked"): Promise<void>;
  saveStep(runId: string, stepId: string, result: AgentResult): Promise<void>;
}

export class DurableWorkflowEngine {
  constructor(private readonly runtime: AgentRuntime, private readonly store: WorkflowStore) {}

  async run(runId: string, workflowName: string, steps: readonly { stepId: string; input: ExecutionEnvelope }[]): Promise<void> {
    await this.store.createRun({ runId, workflowName, input: { stepCount: steps.length } });
    await this.store.markRun(runId, "running");
    try {
      for (const step of steps) {
        const result = await this.runtime.execute(step.input);
        await this.store.saveStep(runId, step.stepId, result);
        if (result.status !== "completed") {
          await this.store.markRun(runId, result.status);
          return;
        }
      }
      await this.store.markRun(runId, "completed");
    } catch (error) {
      await this.store.markRun(runId, "failed");
      throw error;
    }
  }
}
