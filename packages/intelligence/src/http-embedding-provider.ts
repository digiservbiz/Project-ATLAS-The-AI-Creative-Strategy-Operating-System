import type { EmbeddingProvider } from "@atlas/contracts";

/**
 * HTTP adapter for OpenAI-compatible embedding APIs.
 * No credentials are stored in ATLAS; the caller supplies an API key at runtime.
 */
export class HttpEmbeddingProvider implements EmbeddingProvider {
  readonly providerId: string;
  readonly modelId: string;
  readonly modelVersion: string;
  readonly dimensions: number;

  constructor(options: {
    providerId?: string;
    modelId: string;
    modelVersion?: string;
    dimensions: number;
    endpoint?: string;
    apiKey: string;
  }) {
    if (!options.apiKey) throw new Error("EMBEDDING_API_KEY_REQUIRED");
    if (!Number.isInteger(options.dimensions) || options.dimensions <= 0) {
      throw new Error("INVALID_EMBEDDING_DIMENSIONS");
    }
    this.providerId = options.providerId ?? "openai-compatible";
    this.modelId = options.modelId;
    this.modelVersion = options.modelVersion ?? "1";
    this.dimensions = options.dimensions;
    this.endpoint = options.endpoint ?? "https://api.openai.com/v1/embeddings";
    this.apiKey = options.apiKey;
  }

  private readonly endpoint: string;
  private readonly apiKey: string;

  async embed(input: string): Promise<number[]> {
    const vectors = await this.embedBatch([input]);
    return vectors[0];
  }

  async embedBatch(inputs: string[]): Promise<number[][]> {
    if (!inputs.length) return [];
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + this.apiKey,
      },
      body: JSON.stringify({ model: this.modelId, input: inputs }),
    });
    if (!response.ok) throw new Error("EMBEDDING_PROVIDER_HTTP_" + response.status);
    const body = await response.json() as { data?: Array<{ embedding?: number[]; index?: number }> };
    const data = body.data ?? [];
    const ordered = [...data].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)).map((item) => item.embedding ?? []);
    if (ordered.length !== inputs.length) throw new Error("EMBEDDING_PROVIDER_COUNT_MISMATCH");
    for (const vector of ordered) {
      if (vector.length !== this.dimensions || !vector.every(Number.isFinite)) {
        throw new Error("EMBEDDING_PROVIDER_VECTOR_INVALID");
      }
    }
    return ordered;
  }
}
