import type { AgentContext, AgentResult, AgentSkill, WorkflowRun, WorkflowStep } from "./contracts";

export * from "./contracts";

export class AtlasOrchestrator {
  private readonly skills = new Map<string, AgentSkill>();

  constructor(skills: AgentSkill[] = []) {
    for (const skill of skills) this.skills.set(skill.skillId, skill);
  }

  register(skill: AgentSkill): void {
    this.skills.set(skill.skillId, skill);
  }

  async run(runId: string, context: AgentContext, steps: WorkflowStep[]): Promise<WorkflowRun> {
    const status: Record<string, WorkflowRun["status"]> = {};
    const outputs: Record<string, AgentResult> = {};
    for (const step of steps) status[step.id] = "pending";

    for (const step of steps) {
      const dependencies = step.dependsOn ?? [];
      if (dependencies.some((dependency) => status[dependency] !== "completed")) {
        status[step.id] = "skipped";
        continue;
      }
      const skill = this.skills.get(step.skillId);
      if (!skill) {
        status[step.id] = "failed";
        throw new Error(`Skill not registered: ${step.skillId}`);
      }

      status[step.id] = "running";
      try {
        const result = await skill.execute({
          ...context,
          memory: { ...context.memory, workflowOutputs: outputs },
        });
        outputs[step.id] = result;
        status[step.id] = "completed";
        if (result.requiresApproval) break;
      } catch (error) {
        status[step.id] = "failed";
        throw error;
      }
    }

    const values = Object.values(status);
    const overall: WorkflowRun["status"] = values.includes("failed")
      ? "failed"
      : values.includes("running")
        ? "running"
        : values.includes("skipped") && !values.every((value) => value === "completed")
          ? "skipped"
          : "completed";

    return { id: runId, status: overall, steps: status, outputs };
  }
}
