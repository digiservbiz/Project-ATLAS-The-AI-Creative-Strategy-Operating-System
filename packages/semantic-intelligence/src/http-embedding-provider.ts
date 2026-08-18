import type { EmbeddingProvider } from "@atlas/contracts";

type EmbeddingResponse = { data?: Array<{ embedding?: number[]; index?: number }> };

export interface HttpEmbeddingProviderOptions {
  providerId: string;
  modelId: string;
  modelVersion: string;
  dimensions: number;
  endpoint: string;
  apiKey: string;
  headers?: Record<string, string>;
  batchSize?: number;
}

/** Provider-neutral adapter for OpenAI-compatible embedding HTTP APIs. */
export class HttpEmbeddingProvider implements EmbeddingProvider {
  readonly providerId: string;
  readonly modelId: string;
  readonly modelVersion: string;
  readonly dimensions: number;
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly headers: Record<string, string>;
  private readonly batchSize: number;

  constructor(options: HttpEmbeddingProviderOptions) {
    this.providerId = options.providerId;
    this.modelId = options.modelId;
    this.modelVersion = options.modelVersion;
    this.dimensions = options.dimensions;
    this.endpoint = options.endpoint;
    this.apiKey = options.apiKey;
    this.headers = options.headers ?? {};
    this.batchSize = Math.max(options.batchSize ?? 64, 1);
  }

  async embed(input: string): Promise<number[]> {
    const vectors = await this.embedBatch([input]);
    const vector = vectors[0];
    if (!vector) throw new Error("Embedding provider returned no vector");
    return vector;
  }

  async embedBatch(inputs: string[]): Promise<number[][]> {
    if (inputs.length === 0) return [];
    const output: number[][] = [];

    for (let start = 0; start < inputs.length; start += this.batchSize) {
      const batch = inputs.slice(start, start + this.batchSize);
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...this.headers,
        },
        body: JSON.stringify({ model: this.modelId, input: batch }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Embedding request failed (${response.status}): ${body.slice(0, 500)}`);
      }

      const payload = (await response.json()) as EmbeddingResponse;
      const vectors = (payload.data ?? [])
        .map((item) => ({ index: item.index ?? 0, embedding: item.embedding }))
        .sort((a, b) => a.index - b.index)
        .map((item) => item.embedding);

      if (vectors.length !== batch.length || vectors.some((vector) => !vector)) {
        throw new Error("Embedding provider returned an unexpected response shape");
      }
      for (const vector of vectors) {
        if (vector!.length !== this.dimensions) {
          throw new Error(`Embedding dimension mismatch: expected ${this.dimensions}, received ${vector!.length}`);
        }
        output.push(vector!);
      }
    }

    return output;
  }
}
