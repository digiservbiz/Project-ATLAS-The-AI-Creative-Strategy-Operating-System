import type { EmbeddingSelector, SemanticObject, SemanticRepository, SemanticSearchRequest, SemanticSearchResponse } from "@atlas/contracts";
import { Database } from "@atlas/database";

function assertVector(vector: number[], dimensions: number, label: string) {
  if (vector.length !== dimensions) throw new Error(`${label}_DIMENSION_MISMATCH`);
  if (!vector.every(Number.isFinite)) throw new Error(`${label}_CONTAINS_NON_FINITE_VALUE`);
}

export class PgVectorSemanticRepository implements SemanticRepository {
  constructor(private readonly db: Database) {}

  async upsertObject(object: SemanticObject): Promise<void> {
    await this.db.query(
      `INSERT INTO atlas_semantic_objects
        (id, organization_id, project_id, object_type, source_id, content, language, market, metadata, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,COALESCE($10::timestamptz, now()))
       ON CONFLICT (id) DO UPDATE SET
        organization_id=EXCLUDED.organization_id, project_id=EXCLUDED.project_id,
        object_type=EXCLUDED.object_type, source_id=EXCLUDED.source_id,
        content=EXCLUDED.content, language=EXCLUDED.language, market=EXCLUDED.market,
        metadata=EXCLUDED.metadata`,
      [object.id, object.organizationId, object.projectId, object.objectType, object.sourceId, object.content,
       object.language ?? null, object.market ?? null, JSON.stringify(object.metadata ?? {}), object.createdAt ?? null],
    );
  }

  async saveEmbedding(record: { objectId: string; provider: string; model: string; version: string; dimensions: number; vector: number[] }): Promise<void> {
    assertVector(record.vector, record.dimensions, "EMBEDDING");
    await this.db.query(
      `INSERT INTO atlas_semantic_embeddings
        (object_id, provider, model, version, dimensions, embedding)
       VALUES ($1,$2,$3,$4,$5,$6::vector)
       ON CONFLICT (object_id, provider, model, version) DO UPDATE SET
        dimensions=EXCLUDED.dimensions, embedding=EXCLUDED.embedding`,
      [record.objectId, record.provider, record.model, record.version, record.dimensions, `[${record.vector.join(",")}]`],
    );
  }

  async search(request: SemanticSearchRequest, queryVector: number[], selector: EmbeddingSelector): Promise<SemanticSearchResponse> {
    if (!Number.isInteger(request.topK) || request.topK <= 0) throw new Error("INVALID_TOP_K");
    if (!request.organizationId || !request.projectId) throw new Error("TENANT_SCOPE_REQUIRED");
    if (!Number.isInteger(selector.dimensions) || selector.dimensions <= 0) throw new Error("INVALID_EMBEDDING_DIMENSIONS");
    assertVector(queryVector, selector.dimensions, "QUERY_VECTOR");

    const typeFilter = request.objectTypes.length ? "AND o.object_type = ANY($9::text[])" : "";
    const values: unknown[] = [
      request.organizationId, request.projectId, `[${queryVector.join(",")}]`, request.topK,
      selector.provider, selector.model, selector.version, selector.dimensions,
    ];
    if (request.objectTypes.length) values.push(request.objectTypes);

    const rows = await this.db.query<any>(
      `SELECT o.id, o.organization_id, o.project_id, o.object_type, o.source_id, o.content,
              o.language, o.market, o.metadata, o.created_at,
              1 - (e.embedding <=> $3::vector) AS similarity
       FROM atlas_semantic_objects o
       JOIN atlas_semantic_embeddings e
         ON e.object_id=o.id
        AND e.provider=$5
        AND e.model=$6
        AND e.version=$7
        AND e.dimensions=$8
       WHERE o.organization_id=$1 AND o.project_id=$2 ${typeFilter}
       ORDER BY e.embedding <=> $3::vector
       LIMIT $4`,
      values,
    );

    return {
      embeddingModel: `${selector.provider}/${selector.model}@${selector.version}`,
      results: rows.map((row, index) => ({
        object: {
          id: row.id, organizationId: row.organization_id, projectId: row.project_id,
          objectType: row.object_type, sourceId: row.source_id, content: row.content,
          language: row.language ?? undefined, market: row.market ?? undefined,
          metadata: row.metadata ?? {}, createdAt: row.created_at?.toISOString?.(),
        },
        similarity: Number(row.similarity), rank: index + 1,
        provenance: { repository: "postgres-pgvector", embeddingProvider: selector.provider, embeddingModel: selector.model, embeddingVersion: selector.version, dimensions: selector.dimensions },
      })),
    };
  }
}
