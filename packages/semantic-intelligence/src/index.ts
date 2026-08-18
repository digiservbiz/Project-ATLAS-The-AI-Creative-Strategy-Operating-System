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
    this.assertDimensions(vector);
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
    if (vectors.length !== objects.length) {
      throw new Error("Embedding provider returned an unexpected batch size");
    }
    for (let index = 0; index < objects.length; index += 1) {
      const object = objects[index];
      const vector = vectors[index];
      if (!vector) throw new Error(`Embedding provider returned no vector for item ${index}`);
      this.assertDimensions(vector);
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
    this.assertDimensions(queryVector);
    return this.repository.search(request, queryVector, this.embeddings.modelId);
  }

  private assertDimensions(vector: number[]): void {
    if (vector.length !== this.embeddings.dimensions) {
      throw new Error(
        `Embedding dimension mismatch: expected ${this.embeddings.dimensions}, received ${vector.length}`,
      );
    }
  }
}
