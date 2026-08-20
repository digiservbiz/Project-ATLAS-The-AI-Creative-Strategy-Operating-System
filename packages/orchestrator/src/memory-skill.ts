import type { AgentContext, AgentResult } from "./contracts";
import type { AgentMemoryStore } from "./memory";

export class WorkflowMemory {
  constructor(private readonly store: AgentMemoryStore) {}

  async remember(context: AgentContext, namespace: string, key: string, value: Record<string, unknown>, importance = 0.5): Promise<void> {
    const now = new Date().toISOString();
    const existing = await this.store.get(context.organizationId, namespace, key);
    await this.store.put({
      id: existing?.id ?? `${context.organizationId}:${namespace}:${key}`,
      organizationId: context.organizationId,
      projectId: context.projectId,
      namespace,
      key,
      value,
      importance,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
  }

  async recall(context: AgentContext, namespace: string, projectId = context.projectId): Promise<Record<string, unknown>[]> {
    const records = await this.store.list(context.organizationId, namespace, projectId);
    return records
      .sort((a, b) => b.importance - a.importance || b.updatedAt.localeCompare(a.updatedAt))
      .map((record) => record.value);
  }

  async captureResult(context: AgentContext, stepId: string, result: AgentResult): Promise<void> {
    await this.remember(context, "workflow", stepId, {
      output: result.output,
      artifacts: result.artifacts ?? [],
      decisions: result.decisions ?? [],
      requiresApproval: result.requiresApproval ?? false,
    }, result.requiresApproval ? 1 : 0.7);
  }
}
