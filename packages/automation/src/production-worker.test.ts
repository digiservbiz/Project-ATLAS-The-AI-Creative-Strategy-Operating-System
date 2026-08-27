import { describe, expect, it } from "vitest";
import type { AgentContext, AgentSkill, WorkflowStep } from "@atlas/orchestrator";
import { AtlasOrchestrator } from "@atlas/orchestrator";
import { ProductionAtlasRuntime, type RuntimeRecord, type RuntimeStore } from "@atlas/runtime";
import { InMemoryDurableJobStore } from "./durable-job-queue";
import { ProductionWorkflowWorker } from "./production-worker";

class RuntimeMemoryStore implements RuntimeStore {
  records = new Map<string, RuntimeRecord>();
  async get(id: string) { return this.records.get(id) ?? null; }
  async save(record: RuntimeRecord) { this.records.set(record.id, record); }
}

const context: AgentContext = { organizationId: "org", objective: "worker test", inputs: {}, memory: {} };
const steps: WorkflowStep[] = [{ id: "research", skillId: "research" }];
const skill: AgentSkill = { skillId: "research", async execute() { return { output: { ok: true } }; } };

describe("ProductionWorkflowWorker", () => {
  it("claims and completes a runtime workflow job", async () => {
    const jobs = new InMemoryDurableJobStore(); const runtimes = new RuntimeMemoryStore();
    const runtime = new ProductionAtlasRuntime(runtimes, { enqueue: async () => undefined }, new AtlasOrchestrator([skill]));
    const record = await runtime.submit("runtime-1", context, steps);
    await jobs.enqueue({ id: "job-1", type: "workflow.run", payload: { runtimeId: record.id, runId: "run-1", context, steps }, attempts: 0, maxAttempts: 3, runAt: Date.now(), status: "queued" });
    const worker = new ProductionWorkflowWorker(jobs, runtime);
    expect(await worker.tick()).toBe(true);
    expect((await runtimes.get("runtime-1"))?.status).toBe("completed");
  });
});
