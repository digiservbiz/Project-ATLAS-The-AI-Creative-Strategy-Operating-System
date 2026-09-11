import type {
  AgentContext,
  AgentResult,
  AgentSkill,
  WorkflowRun,
  WorkflowStep,
  WorkflowStepStatus,
} from "./contracts.js";

export * from "./contracts.js";

interface WorkflowExecutionState {
  status: Record<string, WorkflowStepStatus>;
  outputs: Record<string, AgentResult>;
}

export class AtlasOrchestrator {
  private readonly skills = new Map<string, AgentSkill>();

  constructor(skills: AgentSkill[] = []) {
    for (const skill of skills) this.skills.set(skill.skillId, skill);
  }

  register(skill: AgentSkill): void {
    this.skills.set(skill.skillId, skill);
  }

  async run(runId: string, context: AgentContext, steps: WorkflowStep[]): Promise<WorkflowRun> {
    const status: Record<string, WorkflowStepStatus> = {};
    const outputs: Record<string, AgentResult> = {};
    for (const step of steps) status[step.id] = "pending";

    return this.execute(runId, context, steps, { status, outputs });
  }

  async resume(
    runId: string,
    context: AgentContext,
    steps: WorkflowStep[],
    previous: WorkflowRun,
  ): Promise<WorkflowRun> {
    if (previous.status !== "awaiting_approval") {
      throw new Error(`Workflow is not awaiting approval: ${previous.id}`);
    }

    const status: Record<string, WorkflowStepStatus> = {};
    const outputs: Record<string, AgentResult> = { ...previous.outputs };

    for (const step of steps) {
      status[step.id] = previous.steps[step.id] ?? "pending";
    }

    return this.execute(runId, context, steps, { status, outputs });
  }

  private async execute(
    runId: string,
    context: AgentContext,
    steps: WorkflowStep[],
    state: WorkflowExecutionState,
  ): Promise<WorkflowRun> {
    let approvalRequested = false;

    for (const step of steps) {
      if (state.status[step.id] === "completed") continue;
      if (state.status[step.id] === "failed") break;

      const dependencies = step.dependsOn ?? [];
      if (dependencies.some((dependency: string) => state.status[dependency] !== "completed")) {
        state.status[step.id] = "skipped";
        continue;
      }

      const skill = this.skills.get(step.skillId);
      if (!skill) {
        state.status[step.id] = "failed";
        throw new Error(`Skill not registered: ${step.skillId}`);
      }

      state.status[step.id] = "running";
      try {
        const result = await skill.execute({
          ...context,
          memory: { ...context.memory, workflowOutputs: state.outputs },
        });
        state.outputs[step.id] = result;
        state.status[step.id] = "completed";
        if (result.requiresApproval) {
          approvalRequested = true;
          break;
        }
      } catch (error) {
        state.status[step.id] = "failed";
        throw error;
      }
    }

    const values = Object.values(state.status);
    const overall: WorkflowRun["status"] = approvalRequested
      ? "awaiting_approval"
      : values.includes("failed")
        ? "failed"
        : values.includes("skipped") && !values.every((value) => value === "completed")
          ? "skipped"
          : "completed";

    return { id: runId, status: overall, steps: state.status, outputs: state.outputs };
  }
}
