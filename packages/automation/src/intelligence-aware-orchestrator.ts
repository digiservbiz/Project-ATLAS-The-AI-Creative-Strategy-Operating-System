import { AtlasOrchestrator, type AgentContext, type AgentSkill, type WorkflowRun, type WorkflowStep } from "@atlas/orchestrator";
import { selectNextWorkflow, type IntelligenceSnapshot } from "@atlas/intelligence";

export type WorkflowSkillMap = Partial<Record<ReturnType<typeof selectNextWorkflow>["workflow"], string>>;

/**
 * Intelligence-aware orchestration adds one critical safety boundary to the
 * generic orchestrator: a decision that requires human approval must never
 * execute the selected workflow skill before that approval exists.
 *
 * Approval is represented as a normal AgentResult so the existing runtime can
 * transition the job to `awaiting_approval` without changing the core
 * WorkflowRun contract.
 */
export class IntelligenceAwareOrchestrator extends AtlasOrchestrator {
  constructor(skills: AgentSkill[], private readonly workflowSkillMap: WorkflowSkillMap = {}) {
    super(skills);
  }

  override async run(runId: string, context: AgentContext, steps: WorkflowStep[]): Promise<WorkflowRun> {
    const snapshot = context.memory.intelligenceSnapshot as IntelligenceSnapshot | undefined;
    if (!snapshot) return super.run(runId, context, steps);
    if (snapshot.business.business.id !== snapshot.state.businessId) {
      throw new Error("Intelligence snapshot business/state scope mismatch");
    }

    const decision = selectNextWorkflow({ snapshot, signals: {} });
    const decisionContext: AgentContext = {
      ...context,
      memory: { ...context.memory, intelligenceDecision: decision },
    };

    if (decision.requiresApproval) {
      const status: Record<string, WorkflowRun["status"]> = {};
      const outputs: WorkflowRun["outputs"] = {};
      for (const step of steps) status[step.id] = "skipped";
      if (steps.length > 0) {
        const gateStep = steps[0];
        outputs[gateStep.id] = {
          output: {
            approvalRequired: true,
            workflow: decision.workflow,
            reason: decision.reason,
            priority: decision.priority,
            confidence: decision.confidence,
            actionId: decision.actionId,
          },
          decisions: ["Human approval is required before executing this intelligence-selected workflow."],
          requiresApproval: true,
        };
      }
      return {
        id: runId,
        status: steps.length > 0 ? "skipped" : "completed",
        steps: status,
        outputs,
      };
    }

    const selectedSkill = this.workflowSkillMap[decision.workflow];
    if (!selectedSkill || steps.length === 0) return super.run(runId, decisionContext, steps);

    const plannedSteps = steps.map((step, index) => index === 0 ? { ...step, skillId: selectedSkill } : step);
    return super.run(runId, decisionContext, plannedSteps);
  }
}
