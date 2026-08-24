export interface RetryPolicy { maxAttempts: number; baseDelayMs: number; maxDelayMs: number; }
export interface CacheEntry<T> { value: T; expiresAt: number; }
export interface SourceHealth { sourceId: string; successes: number; failures: number; consecutiveFailures: number; lastSuccessAt?: string; lastFailureAt?: string; disabledUntil?: string; }

export class ResearchReliability {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly health = new Map<string, SourceHealth>();

  constructor(private readonly policy: RetryPolicy = { maxAttempts: 3, baseDelayMs: 250, maxDelayMs: 5000 }) {}

  async execute<T>(sourceId: string, operation: () => Promise<T>): Promise<T> {
    const state = this.health.get(sourceId) ?? { sourceId, successes: 0, failures: 0, consecutiveFailures: 0 };
    if (state.disabledUntil && Date.parse(state.disabledUntil) > Date.now()) throw new Error(`Research source ${sourceId} temporarily disabled`);
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.policy.maxAttempts; attempt++) {
      try {
        const result = await operation();
        state.successes++; state.consecutiveFailures = 0; state.lastSuccessAt = new Date().toISOString();
        delete state.disabledUntil; this.health.set(sourceId, state);
        return result;
      } catch (error) {
        lastError = error; state.failures++; state.consecutiveFailures++;
        state.lastFailureAt = new Date().toISOString(); this.health.set(sourceId, state);
        if (attempt < this.policy.maxAttempts) {
          const delay = Math.min(this.policy.maxDelayMs, this.policy.baseDelayMs * 2 ** (attempt - 1));
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    if (state.consecutiveFailures >= this.policy.maxAttempts) {
      state.disabledUntil = new Date(Date.now() + 60_000).toISOString(); this.health.set(sourceId, state);
    }
    throw lastError;
  }

  getCached<T>(key: string): T | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) { this.cache.delete(key); return undefined; }
    return entry.value;
  }

  setCached<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  healthSnapshot(): SourceHealth[] { return [...this.health.values()].map((item) => ({ ...item })); }
}
