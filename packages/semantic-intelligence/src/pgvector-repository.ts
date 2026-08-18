import type {
  SemanticEmbedding,
  SemanticObject,
  SemanticRepository,
  SemanticSearchRequest,
  SemanticSearchResponse,
} from "@atlas/contracts";
import type { Database } from "@atlas/database";

function vectorLiteral(vector: number[]): string {
  if (vector.length === 0 || vector.some((value) => !Number.isFinite(value))) {
    throw new Error("Embedding vector must contain finite values");
  }
  return `[${vector.join(",")}]`;
}

export class PgVectorSemanticRepository implements SemanticRepository {
  constructor(private readonly database: Database) {}

  async upsertObject(object: SemanticObject): Promise<void> {
    await this.database.query(
      `INSERT INTO semantic_objects
        (id, organization_id, project_id, object_type, source_id, content, metadata, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,COALESCE($8::timestamptz, now()))
       ON CONFLICT (id) DO UPDATE SET
         content = EXCLUDED.content,
         metadata = EXCLUDED.metadata,
         object_type = EXCLUDED.object_type,
         source_id = EXCLUDED.source_id`,
      [
        object.id,
        object.organizationId,
        object.projectId,
        object.objectType,
        object.sourceId ?? null,
        object.content,
        JSON.stringify(object.metadata ?? {}),
        object.createdAt ?? null,
      ],
    );
  }

  async saveEmbedding(embedding: SemanticEmbedding): Promise<void> {
    await this.database.query(
      `INSERT INTO semantic_embeddings
        (object_id, provider, model, version, dimensions, embedding)
       VALUES ($1,$2,$3,$4,$5,$6::vector)
       ON CONFLICT (object_id, provider, model, version) DO UPDATE SET
         dimensions = EXCLUDED.dimensions,
         embedding = EXCLUDED.embedding,
         created_at = now()`,
      [
        embedding.objectId,
        embedding.provider,
        embedding.model,
        embedding.version,
        embedding.dimensions,
        vectorLiteral(embedding.vector),
      ],
    );
  }

  async search(request: SemanticSearchRequest): Promise<SemanticSearchResponse> {
    const limit = Math.min(Math.max(request.limit ?? 10, 1), 100);
    const vector = vectorLiteral(request.queryVector);
    const values: unknown[] = [request.organizationId, vector, limit];
    const filters: string[] = ["o.organization_id = $1"];

    if (request.projectId) {
      values.push(request.projectId);
      filters.push(`o.project_id = $${values.length}`);
    }
    if (request.objectType) {
      values.push(request.objectType);
      filters.push(`o.object_type = $${values.length}`);
    }

    const rows = await this.database.query<{
      id: string;
      object_type: string;
      source_id: string | null;
      content: string;
      metadata: Record<string, unknown>;
      similarity: number;
    }>(
      `SELECT o.id, o.object_type, o.source_id, o.content, o.metadata,
              1 - (e.embedding <=> $2::vector) AS similarity
       FROM semantic_embeddings e
       JOIN semantic_objects o ON o.id = e.object_id
       WHERE ${filters.join(" AND ")}
       ORDER BY e.embedding <=> $2::vector
       LIMIT $3`,
      values,
    );

    return {
      results: rows.map((row) => ({
        object: {
          id: row.id,
          objectType: row.object_type,
          sourceId: row.source_id ?? undefined,
          content: row.content,
          metadata: row.metadata,
        },
        similarity: Number(row.similarity),
      })),
    };
  }
}
