export interface HttpTransport { request<T>(input: { method: "GET" | "POST"; url: string; headers?: Record<string, string>; query?: Record<string, string> }): Promise<{ data: T; status: number; headers?: Record<string, string> }>; }

export interface RateLimitPolicy { maxAttempts?: number; baseDelayMs?: number; maxDelayMs?: number; jitter?: number; }

export class RateLimitedHttpClient {
  constructor(private readonly transport: HttpTransport, private readonly policy: Required<RateLimitPolicy> = { maxAttempts: 4, baseDelayMs: 500, maxDelayMs: 10_000, jitter: 250 }) {}

  async request<T>(input: Parameters<HttpTransport["request"]>[0]): Promise<T> {
    let attempt = 0;
    while (true) {
      attempt += 1;
      try {
        const response = await this.transport.request<T>(input);
        if (response.status < 400) return response.data;
        if (![408, 429, 500, 502, 503, 504].includes(response.status) || attempt >= this.policy.maxAttempts) {
          throw new Error(`HTTP request failed with status ${response.status}`);
        }
        const retryAfter = Number(response.headers?.["retry-after"] ?? 0);
        const exponential = Math.min(this.policy.maxDelayMs, this.policy.baseDelayMs * 2 ** (attempt - 1));
        await delay(Math.max(retryAfter * 1000, exponential) + Math.floor(Math.random() * this.policy.jitter));
      } catch (error) {
        if (attempt >= this.policy.maxAttempts) throw error;
        const exponential = Math.min(this.policy.maxDelayMs, this.policy.baseDelayMs * 2 ** (attempt - 1));
        await delay(exponential + Math.floor(Math.random() * this.policy.jitter));
      }
    }
  }
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
