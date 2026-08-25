export interface RequestResponse<T> { status: number; headers: Record<string, string | undefined>; data: T; }
export interface RequestClient { request<T>(input: unknown): Promise<RequestResponse<T>>; }

export interface RateLimitPolicy { maxRetries?: number; baseDelayMs?: number; maxDelayMs?: number; }

export class ResilientRequest {
  constructor(private readonly client: RequestClient, private readonly policy: RateLimitPolicy = {}) {}

  async run<T>(input: unknown): Promise<RequestResponse<T>> {
    const maxRetries = this.policy.maxRetries ?? 4;
    const base = this.policy.baseDelayMs ?? 500;
    const maxDelay = this.policy.maxDelayMs ?? 30_000;
    let last: RequestResponse<T> | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.client.request<T>(input);
        last = response;
        if (!this.retryable(response.status) || attempt === maxRetries) return response;
        await this.delay(this.retryDelay(response, attempt, base, maxDelay));
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await this.delay(Math.min(maxDelay, base * 2 ** attempt));
      }
    }
    return last as RequestResponse<T>;
  }

  private retryable(status: number) { return status === 408 || status === 425 || status === 429 || status >= 500; }
  private retryDelay<T>(response: RequestResponse<T>, attempt: number, base: number, max: number) {
    const retryAfter = Number(response.headers["retry-after"]);
    if (Number.isFinite(retryAfter) && retryAfter >= 0) return Math.min(max, retryAfter * 1000);
    return Math.min(max, base * 2 ** attempt + Math.floor(Math.random() * base));
  }
  private delay(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }
}
