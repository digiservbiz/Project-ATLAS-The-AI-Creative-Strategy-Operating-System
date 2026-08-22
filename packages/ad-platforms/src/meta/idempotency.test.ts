import { describe, expect, it } from "vitest";
import { IdempotentMetaWriter } from "./idempotency";

describe("IdempotentMetaWriter", () => {
  it("does not repeat a successful write for the same key", async () => {
    let calls = 0;
    const values = new Map<string, { id?: string }>();
    const writer = new IdempotentMetaWriter({
      async post(_path, _body) { calls++; return { id: `campaign-${calls}` }; },
    }, {
      async has(key) { return values.get(key); },
      async save(key, value) { values.set(key, value); },
    });
    const first = await writer.post("strategy-123", "act_1/campaigns", { name: "ATLAS" });
    const second = await writer.post("strategy-123", "act_1/campaigns", { name: "ATLAS" });
    expect(first.id).toBe("campaign-1");
    expect(second.id).toBe("campaign-1");
    expect(calls).toBe(1);
  });
});
