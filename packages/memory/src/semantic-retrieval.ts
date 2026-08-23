export interface EmbeddingProvider { embed(text: string): Promise<number[]>; }
export interface SemanticRecord { id: string; text: string; vector: number[]; metadata: Record<string, unknown>; }
export interface SemanticStore { upsert(record: SemanticRecord): Promise<void>; search(vector: number[], limit: number, filter?: Record<string, unknown>): Promise<SemanticRecord[]>; }

export class SemanticRetrievalService {
  constructor(private readonly embeddings: EmbeddingProvider, private readonly store: SemanticStore) {}

  async index(id: string, text: string, metadata: Record<string, unknown> = {}): Promise<SemanticRecord> {
    if (!text.trim()) throw new Error("Cannot index empty text");
    const vector = await this.embeddings.embed(text);
    const record = { id, text, vector, metadata };
    await this.store.upsert(record);
    return record;
  }

  async retrieve(query: string, limit = 8, filter?: Record<string, unknown>): Promise<SemanticRecord[]> {
    if (!query.trim()) return [];
    const vector = await this.embeddings.embed(query);
    return this.store.search(vector, limit, filter);
  }
}
