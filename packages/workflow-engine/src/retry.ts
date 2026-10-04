export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 5000,
};

export function retryDelayMs(policy: RetryPolicy, attempt: number): number {
  if (!Number.isInteger(policy.maxAttempts) || policy.maxAttempts < 1) throw new Error("INVALID_RETRY_POLICY");
  if (!Number.isFinite(policy.baseDelayMs) || policy.baseDelayMs < 0) throw new Error("INVALID_RETRY_POLICY");
  if (!Number.isFinite(policy.maxDelayMs) || policy.maxDelayMs < policy.baseDelayMs) throw new Error("INVALID_RETRY_POLICY");
  return Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** Math.max(0, attempt - 1));
}

export function isRetryableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /(?:TIMEOUT|RATE_LIMIT|TEMPORARY|UNAVAILABLE|ECONNRESET|ETIMEDOUT)/i.test(message);
}
