export interface JobExecutionStore { get(key: string): Promise<unknown | undefined>; put(key: string, result: unknown, expiresAt?: number): Promise<void>; }

export class IdempotentJobExecutor<T = unknown> {
  constructor(private readonly store: JobExecutionStore) {}

  async execute(key: string, operation: () => Promise<T>, ttlMs = 24 * 60 * 60 * 1000): Promise<T> {
    if (!key) throw new Error("Idempotency key is required");
    const cached = await this.store.get(key);
    if (cached !== undefined) return cached as T;
    const result = await operation();
    await this.store.put(key, result, Date.now() + ttlMs);
    return result;
  }
}
