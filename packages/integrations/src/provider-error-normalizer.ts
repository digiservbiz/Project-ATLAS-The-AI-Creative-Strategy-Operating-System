export type Platform = "meta" | "tiktok" | "shopify";
export type PlatformErrorKind = "authentication" | "authorization" | "rate_limit" | "validation" | "not_found" | "server" | "network" | "unknown";
export interface NormalizedPlatformError { platform: Platform; kind: PlatformErrorKind; status?: number; retryable: boolean; retryAfterMs?: number; message: string; raw?: unknown; }

export function normalizePlatformError(platform: Platform, error: unknown): NormalizedPlatformError {
  const e = error as { status?: number; statusCode?: number; message?: string; retryAfter?: string | number; response?: { status?: number; headers?: Record<string,string> } };
  const status = e?.status ?? e?.statusCode ?? e?.response?.status;
  const retryHeader = e?.response?.headers?.["retry-after"];
  const retryAfter = e?.retryAfter ?? retryHeader;
  const retryAfterMs = retryAfter === undefined ? undefined : Number(retryAfter) * (String(retryAfter).includes(".") ? 1000 : 1000);
  let kind: PlatformErrorKind = "unknown";
  if (status === 401) kind = "authentication";
  else if (status === 403) kind = "authorization";
  else if (status === 404) kind = "not_found";
  else if (status === 429) kind = "rate_limit";
  else if (status !== undefined && status >= 400 && status < 500) kind = "validation";
  else if (status !== undefined && status >= 500) kind = "server";
  else if (e?.message && /network|timeout|socket|connection/i.test(e.message)) kind = "network";
  return { platform, kind, status, retryable: kind === "rate_limit" || kind === "server" || kind === "network", retryAfterMs, message: e?.message ?? "Platform request failed", raw: error };
}
