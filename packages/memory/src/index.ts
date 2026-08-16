import type { Database } from "@atlas/database";

export interface MemoryRecord {
  id?: string;
  organizationId: string;
  projectId?: string;
  memoryType: string;
  key: string;
  content: string;
  metadata?: Record<string, unknown>;
  embedding?: readonly number[];
}

export class MemoryService {
  constructor(private readonly database: Database) {}

  async save(memory: MemoryRecord): Promise<void> {
    await this.database.query(
      `INSERT INTO memories (organization_id, project_id, memory_type, key, content, metadata, embedding)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
      [
        memory.organizationId,
        memory.projectId ?? null,
        memory.memoryType,
        memory.key,
        memory.content,
        JSON.stringify(memory.metadata ?? {}),
        memory.embedding ? `[${memory.embedding.join(",")}]` : null,
      ],
    );
  }

  async listProjectMemories(organizationId: string, projectId: string, limit = 50): Promise<MemoryRecord[]> {
    const rows = await this.database.query<{
      id: string; organization_id: string; project_id: string | null;
      memory_type: string; key: string; content: string; metadata: Record<string, unknown>;
    }>(
      `SELECT id, organization_id, project_id, memory_type, key, content, metadata
       FROM memories WHERE organization_id = $1 AND project_id = $2
       ORDER BY updated_at DESC LIMIT $3`,
      [organizationId, projectId, limit],
    );

    return rows.map((row) => ({
      id: row.id,
      organizationId: row.organization_id,
      projectId: row.project_id ?? undefined,
      memoryType: row.memory_type,
      key: row.key,
      content: row.content,
      metadata: row.metadata,
    }));
  }
}
