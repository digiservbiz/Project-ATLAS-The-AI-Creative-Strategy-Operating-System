import type {
  EmbeddingRecord,
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
        (id, organization_id, project_id, object_type, source_id, content, language, market, metadata, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,COALESCE($10::timestamptz, now()))
       ON CONFLICT (id) DO UPDATE SET
         content = EXCLUDED.content,
         language = EXCLUDED.language,
         market = EXCLUDED.market,
         metadata = EXCLUDED.metadata,
         object_type = EXCLUDED.object_type,
         source_id = EXCLUDED.source_id`,
      [object.id, object.organizationId, object.projectId, object.objectType, object.sourceId,
        object.content, object.language ?? null, object.market ?? null,
        JSON.stringify(object.metadata ?? {}), object.createdAt ?? null],
    );
  }

  async saveEmbedding(embedding: EmbeddingRecord): Promise<void> {
    await this.database.query(
      `INSERT INTO semantic_embeddings
        (object_id, provider, model, version, dimensions, embedding)
       VALUES ($1,$2,$3,$4,$5,$6::vector)
       ON CONFLICT (object_id, provider, model, version) DO UPDATE SET
         dimensions = EXCLUDED.dimensions, embedding = EXCLUDED.embedding, created_at = now()`,
      [embedding.objectId, embedding.provider, embedding.model, embedding.version,
        embedding.dimensions, vectorLiteral(embedding.vector)],
    );
  }

  async search(
    request: SemanticSearchRequest,
    queryVector: number[],
    embeddingModel: string,
  ): Promise<SemanticSearchResponse> {
    const limit = Math.min(Math.max(request.topK ?? 10, 1), 100);
    const values: unknown[] = [request.organizationId, request.projectId, vectorLiteral(queryVector), embeddingModel];
    const filters: string[] = ["o.organization_id = $1", "o.project_id = $2", "e.model = $4"];

    if (request.objectTypes.length > 0) {
      values.push(request.objectTypes);
      filters.push(`o.object_type = ANY($${values.length}::text[])`);
    }

    const limitIndex = values.length + 1;
    values.push(limit);

    const rows = await this.database.query<{
      id: string; object_type: SemanticObject["objectType"]; source_id: string;
      content: string; language: string | null; market: string | null;
      metadata: Record<string, unknown>; similarity: number;
    }>(
      `SELECT o.id, o.object_type, o.source_id, o.content, o.language, o.market, o.metadata,
              1 - (e.embedding <=> $3::vector) AS similarity
       FROM semantic_embeddings e
       JOIN semantic_objects o ON o.id = e.object_id
       WHERE ${filters.join(" AND ")}
       ORDER BY e.embedding <=> $3::vector
       LIMIT $${limitIndex}`,
      values,
    );

    return {
      embeddingModel,
      results: rows.map((row, index) => ({
        object: {
          id: row.id,
          organizationId: request.organizationId,
          projectId: request.projectId,
          objectType: row.object_type,
          sourceId: row.source_id,
          content: row.content,
          language: row.language ?? undefined,
          market: row.market ?? undefined,
          metadata: row.metadata,
        },
        similarity: Number(row.similarity),
        rank: index + 1,
        provenance: { sourceId: row.source_id },
      })),
    };
  }
}
