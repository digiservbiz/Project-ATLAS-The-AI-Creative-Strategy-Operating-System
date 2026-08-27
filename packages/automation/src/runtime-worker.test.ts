import { describe, expect, it } from "vitest";
import { InMemoryDurableJobStore } from "./durable-job-queue";
import { createRuntimeWorker } from "./runtime-worker";

describe("runtime worker", () => {
  it("executes queued workflow jobs through the runtime executor", async () => {
    const store = new InMemoryDurableJobStore();
    const calls: string[] = [];
    const worker = createRuntimeWorker(store, {
      async execute(runtimeId) { calls.push(runtimeId); },
    });
    await store.enqueue({ id: "j1", type: "workflow.run", payload: { runtimeId: "rt-1", runId: "run-1", context: {} as never, steps: [] }, attempts: 0, maxAttempts: 3, runAt: 0, status: "queued" });
    expect(await worker.tick(0)).toBe(true);
    expect(calls).toEqual(["rt-1"]);
  });
});
