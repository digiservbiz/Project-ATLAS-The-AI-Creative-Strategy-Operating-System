import { describe, expect, it } from "vitest";
import { MetaCampaignWriteExecutor } from "./campaign-write-executor";

describe("MetaCampaignWriteExecutor", () => {
  it("uses an explicit POST transport for writes", async () => {
    const calls: Array<{ method: string; path: string; params?: Record<string, string> }> = [];
    const executor = new MetaCampaignWriteExecutor({
      async request(method, path, params) { calls.push({ method, path, params }); return { id: "meta-1" }; },
    });
    const result = await executor.execute({ platform: "meta", action: "pause", payload: { objectId: "campaign-1" } });
    expect(result.platformObjectId).toBe("meta-1");
    expect(calls).toEqual([{ method: "POST", path: "campaign-1", params: { status: "PAUSED" } }]);
  });

  it("rejects writes without an object id", async () => {
    const executor = new MetaCampaignWriteExecutor({ async request() { return {}; } });
    await expect(executor.execute({ platform: "meta", action: "pause", payload: {} })).rejects.toThrow("objectId");
  });
});
