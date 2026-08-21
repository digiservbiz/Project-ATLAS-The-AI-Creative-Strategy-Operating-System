export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

export class MetaApiError extends Error {
  constructor(message: string, readonly status?: number, readonly retryable = false) {
    super(message);
    this.name = "MetaApiError";
  }
}

export async function withMetaRetry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 250;
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const retryable = error instanceof MetaApiError && error.retryable;
      if (!retryable || attempt === maxAttempts) throw error;
      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }
  throw new Error("Unreachable");
}
