import type {
  EmbeddingProvider,
  SemanticObject,
  SemanticRepository,
  SemanticSearchRequest,
  SemanticSearchResponse,
} from "@atlas/contracts";

export class SemanticIntelligenceService {
  constructor(
    private readonly embeddings: EmbeddingProvider,
    private readonly repository: SemanticRepository,
  ) {}

  async index(object: SemanticObject): Promise<void> {
    const vector = await this.embeddings.embed(object.content);
    await this.repository.upsertObject(object);
    await this.repository.saveEmbedding({
      objectId: object.id,
      provider: this.embeddings.providerId,
      model: this.embeddings.modelId,
      version: this.embeddings.modelVersion,
      dimensions: this.embeddings.dimensions,
      vector,
    });
  }

  async indexBatch(objects: SemanticObject[]): Promise<void> {
    if (objects.length === 0) return;
    const vectors = await this.embeddings.embedBatch(objects.map((object) => object.content));
    for (let index = 0; index < objects.length; index += 1) {
      const object = objects[index];
      const vector = vectors[index];
      if (!vector) throw new Error(`Embedding provider returned no vector for item ${index}`);
      await this.repository.upsertObject(object);
      await this.repository.saveEmbedding({
        objectId: object.id,
        provider: this.embeddings.providerId,
        model: this.embeddings.modelId,
        version: this.embeddings.modelVersion,
        dimensions: this.embeddings.dimensions,
        vector,
      });
    }
  }

  async search(request: SemanticSearchRequest): Promise<SemanticSearchResponse> {
    const queryVector = await this.embeddings.embed(request.query);
    return this.repository.search({ ...request, queryVector });
  }
}
