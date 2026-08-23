import type { AgentTask, AgentResult, AgentExecutor } from "../../agents/src/agent-contracts";
import { routeNextAgents } from "../../agents/src/agent-contracts";

export type WorkflowStatus = "completed" | "blocked" | "failed" | "running";
export interface WorkflowNode { id: string; agentId: string; objective: string; input?: unknown; dependsOn?: string[]; requiresApproval?: boolean; }
export interface WorkflowDefinition { id: string; goal: string; nodes: WorkflowNode[]; }
export interface WorkflowState { id: string; status: WorkflowStatus; completed: string[]; blocked: string[]; failed: string[]; results: Record<string, AgentResult>; }
export interface WorkflowStore { save(state: WorkflowState): Promise<void>; }

export class WorkflowEngine {
  constructor(private readonly executor: AgentExecutor, private readonly store: WorkflowStore) {}

  async run(definition: WorkflowDefinition, state?: WorkflowState): Promise<WorkflowState> {
    const current: WorkflowState = state ?? { id: definition.id, status: "running", completed: [], blocked: [], failed: [], results: {} };
    while (current.completed.length + current.blocked.length + current.failed.length < definition.nodes.length) {
      const ready = definition.nodes.filter((node) =>
        !current.completed.includes(node.id) && !current.blocked.includes(node.id) && !current.failed.includes(node.id) &&
        (node.dependsOn ?? []).every((dependency) => current.completed.includes(dependency))
      );
      if (!ready.length) { current.status = "blocked"; break; }

      const batch = await Promise.all(ready.map(async (node) => {
        if (node.requiresApproval) return { node, blocked: true } as const;
        const task: AgentTask = { id: `${definition.id}:${node.id}`, agentId: node.agentId, objective: node.objective, input: node.input, context: { workflowId: definition.id } };
        const result = await this.executor.execute(task);
        return { node, result } as const;
      }));

      for (const item of batch) {
        if ("blocked" in item) { current.blocked.push(item.node.id); continue; }
        current.results[item.node.id] = item.result;
        if (item.result.status === "completed") current.completed.push(item.node.id);
        else current.failed.push(item.node.id);
      }
      await this.store.save(current);
    }
    if (current.completed.length === definition.nodes.length) current.status = "completed";
    else if (current.failed.length) current.status = "failed";
    await this.store.save(current);
    return current;
  }

  static expandRoutes(nodes: WorkflowNode[]): WorkflowNode[] {
    const expanded = [...nodes];
    for (const node of nodes) for (const next of routeNextAgents(node.agentId)) {
      if (!expanded.some((candidate) => candidate.agentId === next)) expanded.push({ id: `${next}-auto`, agentId: next, objective: `Continue workflow from ${node.id}`, dependsOn: [node.id] });
    }
    return expanded;
  }
}
