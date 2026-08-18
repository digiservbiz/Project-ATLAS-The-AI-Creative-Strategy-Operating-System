import type {
  SemanticEmbedding,
  SemanticObject,
  SemanticRepository,
  SemanticSearchRequest,
  SemanticSearchResponse,
} from "@atlas/contracts";

export class InMemorySemanticRepository implements SemanticRepository {
  private readonly objects = new Map<string, SemanticObject>();
  private readonly embeddings = new Map<string, SemanticEmbedding>();

  async upsertObject(object: SemanticObject): Promise<void> {
    this.objects.set(object.id, object);
  }

  async saveEmbedding(embedding: SemanticEmbedding): Promise<void> {
    this.embeddings.set(embedding.objectId, embedding);
  }

  async search(request: SemanticSearchRequest): Promise<SemanticSearchResponse> {
    const candidates = [...this.embeddings.values()]
      .map((embedding) => {
        const object = this.objects.get(embedding.objectId);
        if (!object || object.organizationId !== request.organizationId) return null;
        if (request.projectId && object.projectId !== request.projectId) return null;
        if (request.objectType && object.objectType !== request.objectType) return null;
        return { object, similarity: cosine(request.queryVector, embedding.vector) };
      })
      .filter((item): item is { object: SemanticObject; similarity: number } => item !== null)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, Math.min(Math.max(request.limit ?? 10, 1), 100));

    return { results: candidates };
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
