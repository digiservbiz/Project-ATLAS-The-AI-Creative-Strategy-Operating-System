export interface AgentMemoryRecord {
  id: string;
  organizationId: string;
  projectId?: string;
  namespace: string;
  key: string;
  value: Record<string, unknown>;
  importance: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentMemoryStore {
  get(organizationId: string, namespace: string, key: string): Promise<AgentMemoryRecord | null>;
  put(record: AgentMemoryRecord): Promise<void>;
  list(organizationId: string, namespace: string, projectId?: string): Promise<AgentMemoryRecord[]>;
}

export class InMemoryAgentMemoryStore implements AgentMemoryStore {
  private readonly records = new Map<string, AgentMemoryRecord>();

  async get(organizationId: string, namespace: string, key: string): Promise<AgentMemoryRecord | null> {
    return this.records.get(this.id(organizationId, namespace, key)) ?? null;
  }

  async put(record: AgentMemoryRecord): Promise<void> {
    this.records.set(this.id(record.organizationId, record.namespace, record.key), record);
  }

  async list(organizationId: string, namespace: string, projectId?: string): Promise<AgentMemoryRecord[]> {
    return [...this.records.values()].filter((record) =>
      record.organizationId === organizationId &&
      record.namespace === namespace &&
      (!projectId || record.projectId === projectId),
    );
  }

  private id(organizationId: string, namespace: string, key: string): string {
    return `${organizationId}:${namespace}:${key}`;
  }
}
