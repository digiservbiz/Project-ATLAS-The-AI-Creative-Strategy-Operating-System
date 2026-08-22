import type { MetaWriteResponse, MetaWriteHttpClient } from "./write-transport";

export interface IdempotencyStore { has(key: string): Promise<MetaWriteResponse | undefined>; save(key: string, response: MetaWriteResponse): Promise<void>; }

export class IdempotentMetaWriter {
  constructor(private readonly http: MetaWriteHttpClient, private readonly store: IdempotencyStore) {}

  async post(key: string, path: string, body: Record<string, string>): Promise<MetaWriteResponse> {
    if (!key) throw new Error("Idempotency key is required");
    const existing = await this.store.has(key);
    if (existing) return existing;
    const response = await this.http.post(path, { ...body, idempotency_key: key });
    await this.store.save(key, response);
    return response;
  }
}
