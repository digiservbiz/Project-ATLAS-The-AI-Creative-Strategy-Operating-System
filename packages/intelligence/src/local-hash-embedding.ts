import type { EmbeddingProvider } from "@atlas/contracts";

/** Deterministic local embedding for development/tests. Not intended for production semantic quality. */
export class LocalHashEmbeddingProvider implements EmbeddingProvider {
  readonly providerId = "local-hash";
  readonly modelId = "atlas-local-hash";
  readonly modelVersion = "1";
  readonly dimensions: number;

  constructor(dimensions = 128) {
    if (!Number.isInteger(dimensions) || dimensions <= 0) throw new Error("dimensions must be positive");
    this.dimensions = dimensions;
  }

  async embed(input: string): Promise<number[]> {
    const vector = new Array<number>(this.dimensions).fill(0);
    const normalized = input.normalize("NFKC").toLowerCase();
    for (let i = 0; i < normalized.length; i++) {
      const code = normalized.charCodeAt(i);
      const index = (code * 31 + i * 17) % this.dimensions;
      vector[index] += ((code % 23) + 1) / 23;
    }
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map((value) => value / norm);
  }

  async embedBatch(inputs: string[]): Promise<number[][]> {
    return Promise.all(inputs.map((input) => this.embed(input)));
  }
}
