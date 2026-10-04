import type { AgentResult } from "@atlas/agent-runtime";
import type { WorkflowStep, WorkflowRunResult, WorkflowRunRecord, WorkflowRunStore, WorkflowEngine } from "./index.js";

export function validateResumePlan(record: WorkflowRunRecord, steps: readonly WorkflowStep[]): void {
  if (!steps.length) throw new Error("WORKFLOW_RESUME_REQUIRES_STEPS");
  if (steps[0].input.execution.runId !== record.runId) throw new Error("WORKFLOW_RESUME_RUN_MISMATCH");
  if (steps[0].input.context.organizationId !== record.organizationId || steps[0].input.context.projectId !== record.projectId) {
    throw new Error("WORKFLOW_RESUME_SCOPE_MISMATCH");
  }
  const ids = steps.map((step) => step.stepId);
  if (new Set(ids).size !== ids.length) throw new Error("WORKFLOW_DUPLICATE_STEP_ID");
  for (let i = 0; i < record.completedSteps.length; i++) {
    if (ids[i] !== record.completedSteps[i]) throw new Error("WORKFLOW_CHECKPOINT_MISMATCH");
  }
  if (record.status === "completed" || record.status === "cancelled") throw new Error("WORKFLOW_NOT_RESUMABLE");
}

export async function resumeWorkflow(
  engine: WorkflowEngine,
  store: WorkflowRunStore,
  steps: readonly WorkflowStep[],
): Promise<WorkflowRunResult> {
  const first = steps[0];
  if (!first) throw new Error("WORKFLOW_RESUME_REQUIRES_STEPS");
  const scope = { organizationId: first.input.context.organizationId, projectId: first.input.context.projectId };
  const record = await store.get(first.input.execution.runId, scope);
  if (!record) throw new Error("WORKFLOW_RUN_NOT_FOUND");
  validateResumePlan(record, steps);

  const remaining = steps.slice(record.completedSteps.length);
  if (!remaining.length) {
    await store.update(record.runId, scope, {
      status: record.status === "needs_review" ? "needs_review" : "completed",
      completedSteps: record.completedSteps,
      outputs: record.outputs,
    });
    return { status: record.status === "needs_review" ? "needs_review" : "completed", completedSteps: record.completedSteps, outputs: record.outputs };
  }

  const result = await engine.resumeFromCheckpoint(record, remaining);
  return result;
}
