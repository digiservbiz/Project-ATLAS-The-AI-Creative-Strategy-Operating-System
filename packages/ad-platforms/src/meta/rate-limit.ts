export interface MetaRateLimitSignal {
  usagePercent?: number;
  retryAfterSeconds?: number;
}

export function parseMetaRateLimit(headers: Record<string, string | undefined>): MetaRateLimitSignal {
  const usage = headers["x-business-use-case-usage"] ?? headers["x-app-usage"];
  let usagePercent: number | undefined;
  if (usage) {
    try {
      const parsed = JSON.parse(usage) as Record<string, unknown>;
      const values = Object.values(parsed).flatMap((value) => Array.isArray(value) ? value : [value]);
      const numbers = values.flatMap((value) => {
        if (!value || typeof value !== "object") return [];
        const candidate = (value as Record<string, unknown>).call_count ?? (value as Record<string, unknown>).total_cputime;
        return typeof candidate === "number" ? [candidate] : [];
      });
      if (numbers.length) usagePercent = Math.max(...numbers);
    } catch {
      // Ignore malformed advisory usage headers; the API response remains authoritative.
    }
  }
  const retryAfter = Number(headers["retry-after"]);
  return { usagePercent, retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined };
}
