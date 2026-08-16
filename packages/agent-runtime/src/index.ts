import type { ExecutionEnvelope, AgentIdentity } from "@atlas/contracts";

export interface AgentResult {
  status: "completed" | "needs_review" | "blocked" | "failed";
  result: Record<string, unknown>;
  warnings: string[];
}

export interface AgentDefinition {
  identity: AgentIdentity;
  riskLevel: "low" | "medium" | "high";
  allowedTools: readonly string[];
  execute(input: ExecutionEnvelope): Promise<AgentResult>;
}

export class AgentRegistry {
  private readonly agents = new Map<string, AgentDefinition>();

  register(agent: AgentDefinition): void {
    const key = `${agent.identity.agentId}@${agent.identity.version}`;
    if (this.agents.has(key)) {
      throw new Error(`Agent already registered: ${key}`);
    }
    this.agents.set(key, agent);
  }

  get(agentId: string, version: string): AgentDefinition {
    const agent = this.agents.get(`${agentId}@${version}`);
    if (!agent) {
      throw new Error(`Agent not registered: ${agentId}@${version}`);
    }
    return agent;
  }
}

export class AgentRuntime {
  constructor(private readonly registry: AgentRegistry) {}

  async execute(input: ExecutionEnvelope): Promise<AgentResult> {
    const agent = this.registry.get(
      input.execution.agentId,
      input.execution.agentVersion,
    );

    const requestedTools = new Set(input.tools);
    for (const tool of requestedTools) {
      if (!agent.allowedTools.includes(tool)) {
        return {
          status: "blocked",
          result: {},
          warnings: [`Tool not permitted: ${tool}`],
        };
      }
    }

    return agent.execute(input);
  }
}
