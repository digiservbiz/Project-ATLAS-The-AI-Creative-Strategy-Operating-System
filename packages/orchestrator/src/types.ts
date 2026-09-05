export interface AgentContext {
  organizationId: string;
  projectId?: string;
  objective: string;
  inputs: Record<string, unknown>;
  memory: Record<string, unknown>;
}
