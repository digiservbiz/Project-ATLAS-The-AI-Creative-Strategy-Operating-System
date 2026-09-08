import { describe, expect, it } from "vitest";
import { AtlasOrchestrator, type AgentSkill, type AgentContext, type WorkflowStep } from "@atlas/orchestrator";
import { ProductionAtlasRuntime, type RuntimeRecord, type RuntimeStore } from "./production-runtime";

class MemoryStore implements RuntimeStore {
  records = new Map<string, RuntimeRecord>();
  async get(id: string) { return this.records.get(id) ?? null; }
  async save(record: RuntimeRecord) { this.records.set(record.id, record); }
}

class Queue { jobs: unknown[] = []; async enqueue(job: unknown) { this.jobs.push(job); } }
const context: AgentContext = { organizationId: "org", objective: "test", inputs: {}, memory: {} };
const steps: WorkflowStep[] = [{ id: "one", skillId: "one" }];

const skill: AgentSkill = { skillId: "one", async execute() { return { output: { ok: true } }; } };
const approvalSkill: AgentSkill = { skillId: "approval", async execute() { return { output: { approved: false }, requiresApproval: true }; } };
const approvalSteps: WorkflowStep[] = [{ id: "approval", skillId: "approval" }];

describe("ProductionAtlasRuntime", () => {
  it("submits a durable workflow job and executes it", async () => {
    const store = new MemoryStore(); const queue = new Queue();
    const runtime = new ProductionAtlasRuntime(store, queue, new AtlasOrchestrator([skill]));
    const submitted = await runtime.submit("rt-1", context, steps);
    expect(submitted.status).toBe("queued"); expect(queue.jobs).toHaveLength(1);
    const result = await runtime.execute("rt-1", "run-1", context, steps);
    expect(result.status).toBe("completed"); expect(result.workflow?.steps.one).toBe("completed");
  });

  it("persists an awaiting-approval runtime state", async () => {
    const store = new MemoryStore(); const queue = new Queue();
    const runtime = new ProductionAtlasRuntime(store, queue, new AtlasOrchestrator([approvalSkill]));
    await runtime.submit("rt-approval", context, approvalSteps);
    const result = await runtime.execute("rt-approval", "run-approval", context, approvalSteps);
    expect(result.status).toBe("awaiting_approval");
    expect(result.workflow?.status).toBe("awaiting_approval");
    expect(store.records.get("rt-approval")?.status).toBe("awaiting_approval");
  });
});
