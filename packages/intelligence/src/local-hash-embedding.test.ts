import { describe, expect, it } from "vitest";
import { LocalHashEmbeddingProvider } from "./local-hash-embedding.js";

describe("LocalHashEmbeddingProvider", () => {
  it("produces deterministic normalized vectors", async () => {
    const provider = new LocalHashEmbeddingProvider(32);
    const first = await provider.embed("Customer wants a faster checkout");
    const second = await provider.embed("Customer wants a faster checkout");

    expect(first).toEqual(second);
    expect(first).toHaveLength(32);
    expect(first.every(Number.isFinite)).toBe(true);
    expect(Math.sqrt(first.reduce((sum, value) => sum + value * value, 0))).toBeCloseTo(1, 8);
  });

  it("preserves batch ordering", async () => {
    const provider = new LocalHashEmbeddingProvider(16);
    const batch = await provider.embedBatch(["alpha", "beta", "gamma"]);

    expect(batch).toHaveLength(3);
    expect(batch[0]).toEqual(await provider.embed("alpha"));
    expect(batch[1]).toEqual(await provider.embed("beta"));
    expect(batch[2]).toEqual(await provider.embed("gamma"));
  });

  it("rejects invalid dimensions", () => {
    expect(() => new LocalHashEmbeddingProvider(0)).toThrow("dimensions must be positive");
  });
});
