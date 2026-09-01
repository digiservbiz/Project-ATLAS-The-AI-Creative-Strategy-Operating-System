import { AtlasOrchestrator, type AgentContext, type AgentSkill, type WorkflowRun, type WorkflowStep } from "@atlas/orchestrator";
import { selectNextWorkflow, type IntelligenceSnapshot } from "@atlas/intelligence";

export type WorkflowSkillMap = Partial<Record<ReturnType<typeof selectNextWorkflow>["workflow"], string>>;

export class IntelligenceAwareOrchestrator extends AtlasOrchestrator {
  constructor(
    skills: AgentSkill[],
    private readonly workflowSkillMap: WorkflowSkillMap = {},
  ) {
    super(skills);
  }

  override async run(runId: string, context: AgentContext, steps: WorkflowStep[]): Promise<WorkflowRun> {
    const snapshot = context.memory.intelligenceSnapshot as IntelligenceSnapshot | undefined;
    if (!snapshot) return super.run(runId, context, steps);

    if (snapshot.business.business.id !== snapshot.state.businessId) {
      throw new Error("Intelligence snapshot business/state scope mismatch");
    }
    if (context.projectId && context.projectId !== snapshot.state.projectId) {
      throw new Error("Intelligence snapshot project scope mismatch");
    }

    const decision = selectNextWorkflow({ snapshot, signals: {} });
    const selectedSkill = this.workflowSkillMap[decision.workflow];
    if (!selectedSkill || steps.length === 0) return super.run(runId, context, steps);

    const plannedSteps = steps.map((step, index) =>
      index === 0 ? { ...step, skillId: selectedSkill } : step,
    );
    const enrichedContext: AgentContext = {
      ...context,
      memory: {
        ...context.memory,
        intelligenceDecision: decision,
      },
    };
    return super.run(runId, enrichedContext, plannedSteps);
  }
}
