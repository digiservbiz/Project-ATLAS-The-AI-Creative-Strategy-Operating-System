export type WorkflowStepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface AgentContext {
  organizationId: string;
  projectId?: string;
  objective: string;
  inputs: Record<string, unknown>;
  memory: Record<string, unknown>;
}

export interface AgentResult {
  output: Record<string, unknown>;
  artifacts?: string[];
  decisions?: string[];
  requiresApproval?: boolean;
}

export interface AgentSkill {
  readonly skillId: string;
  execute(context: AgentContext): Promise<AgentResult>;
}

export interface WorkflowStep {
  id: string;
  skillId: string;
  dependsOn?: string[];
}

export interface WorkflowRun {
  id: string;
  status: WorkflowStepStatus;
  steps: Record<string, WorkflowStepStatus>;
  outputs: Record<string, AgentResult>;
}
