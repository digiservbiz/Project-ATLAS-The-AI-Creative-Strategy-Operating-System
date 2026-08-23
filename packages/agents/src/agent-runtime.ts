import type { AgentTask, AgentResult, AgentExecutor } from "./agent-contracts";
import { routeNextAgents } from "./agent-contracts";
import type { KnowledgeRuntime } from "./knowledge-runtime";

export interface AgentHandler { run(task: AgentTask, knowledge: string): Promise<Omit<AgentResult, "taskId" | "agentId" | "nextAgentIds">>; }
export interface AgentResultStore { save(result: AgentResult): Promise<void>; }

export class AgentRuntime implements AgentExecutor {
  constructor(
    private readonly handlers: Record<string, AgentHandler>,
    private readonly knowledge: KnowledgeRuntime,
    private readonly results: AgentResultStore,
  ) {}

  async execute<T, R>(task: AgentTask<T>): Promise<AgentResult<R>> {
    const handler = this.handlers[task.agentId];
    if (!handler) {
      const result: AgentResult = { taskId: task.id, agentId: task.agentId, status: "failed", output: null, evidence: [], nextAgentIds: [], warnings: [`No handler registered for ${task.agentId}`] };
      await this.results.save(result);
      return result as AgentResult<R>;
    }
    const context = await this.knowledge.retrieve(task.knowledgeQuery ?? task.objective, task.agentId);
    try {
      const executed = await handler.run(task, context.rules.join("\n"));
      const result: AgentResult = { ...executed, taskId: task.id, agentId: task.agentId, nextAgentIds: routeNextAgents(task.agentId) } as AgentResult;
      await this.results.save(result);
      return result as AgentResult<R>;
    } catch (error) {
      const result: AgentResult = { taskId: task.id, agentId: task.agentId, status: "failed", output: null, evidence: [], nextAgentIds: [], warnings: [error instanceof Error ? error.message : "Agent execution failed"] };
      await this.results.save(result);
      return result as AgentResult<R>;
    }
  }
}
