import { describe, expect, it } from "vitest";
import { DEFAULT_RETRY_POLICY, isRetryableError, retryDelayMs } from "./retry.js";

describe("retry policy", () => {
  it("uses bounded exponential backoff", () => {
    expect(retryDelayMs(DEFAULT_RETRY_POLICY, 1)).toBe(250);
    expect(retryDelayMs(DEFAULT_RETRY_POLICY, 2)).toBe(500);
    expect(retryDelayMs(DEFAULT_RETRY_POLICY, 3)).toBe(1000);
    expect(retryDelayMs(DEFAULT_RETRY_POLICY, 10)).toBe(5000);
  });

  it("classifies transient failures", () => {
    expect(isRetryableError(new Error("MODEL_TIMEOUT"))).toBe(true);
    expect(isRetryableError(new Error("RATE_LIMIT"))).toBe(true);
    expect(isRetryableError(new Error("INVALID_INPUT"))).toBe(false);
  });
});
