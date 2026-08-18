import type {
  EmbeddingRecord,
  SemanticObject,
  SemanticRepository,
  SemanticSearchRequest,
  SemanticSearchResponse,
} from "@atlas/contracts";

export class InMemorySemanticRepository implements SemanticRepository {
  private readonly objects = new Map<string, SemanticObject>();
  private readonly embeddings = new Map<string, EmbeddingRecord>();

  async upsertObject(object: SemanticObject): Promise<void> {
    this.objects.set(object.id, object);
  }

  async saveEmbedding(embedding: EmbeddingRecord): Promise<void> {
    this.embeddings.set(embedding.objectId, embedding);
  }

  async search(
    request: SemanticSearchRequest,
    queryVector: number[],
    embeddingModel: string,
  ): Promise<SemanticSearchResponse> {
    const candidates = [...this.embeddings.values()]
      .map((embedding) => {
        const object = this.objects.get(embedding.objectId);
        if (!object || object.organizationId !== request.organizationId || object.projectId !== request.projectId) return null;
        if (request.objectTypes.length > 0 && !request.objectTypes.includes(object.objectType)) return null;
        if (embedding.model !== embeddingModel) return null;
        return { object, similarity: cosine(queryVector, embedding.vector) };
      })
      .filter((item): item is { object: SemanticObject; similarity: number } => item !== null)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, Math.min(Math.max(request.topK ?? 10, 1), 100));

    return {
      embeddingModel,
      results: candidates.map((item, index) => ({
        ...item,
        rank: index + 1,
        provenance: { sourceId: item.object.sourceId },
      })),
    };
  }
}

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  if (aa === 0 || bb === 0) return 0;
  return dot / (Math.sqrt(aa) * Math.sqrt(bb));
}
