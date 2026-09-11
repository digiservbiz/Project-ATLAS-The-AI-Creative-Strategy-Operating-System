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

class ToggleApprovalSkill implements AgentSkill {
  readonly skillId = "approval";
  calls = 0;
  requiresApproval = true;

  async execute() {
    this.calls += 1;
    return { output: { approved: !this.requiresApproval }, ...(this.requiresApproval ? { requiresApproval: true } : {}) };
  }
}

class DownstreamSkill implements AgentSkill {
  readonly skillId = "downstream";
  calls = 0;

  async execute() {
    this.calls += 1;
    return { output: { executed: true } };
  }
}

const resumeSteps: WorkflowStep[] = [
  { id: "approval", skillId: "approval" },
  { id: "downstream", skillId: "downstream", dependsOn: ["approval"] },
];

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

  it("resumes after approval without re-running completed steps", async () => {
    const store = new MemoryStore();
    const queue = new Queue();
    const approval = new ToggleApprovalSkill();
    const downstream = new DownstreamSkill();
    const runtime = new ProductionAtlasRuntime(store, queue, new AtlasOrchestrator([approval, downstream]));

    await runtime.submit("rt-resume", context, resumeSteps);
    const blocked = await runtime.execute("rt-resume", "run-resume", context, resumeSteps);

    expect(blocked.status).toBe("awaiting_approval");
    expect(blocked.workflow?.steps.approval).toBe("completed");
    expect(blocked.workflow?.steps.downstream).toBe("pending");
    expect(approval.calls).toBe(1);
    expect(downstream.calls).toBe(0);

    approval.requiresApproval = false;
    const resumed = await runtime.resumeAfterApproval("rt-resume", "run-resume", context, resumeSteps);

    expect(resumed.status).toBe("completed");
    expect(resumed.workflow?.status).toBe("completed");
    expect(resumed.workflow?.steps.approval).toBe("completed");
    expect(resumed.workflow?.steps.downstream).toBe("completed");
    expect(approval.calls).toBe(1);
    expect(downstream.calls).toBe(1);
    expect(store.records.get("rt-resume")?.status).toBe("completed");
  });

  it("rejects resume when the runtime is not awaiting approval", async () => {
    const store = new MemoryStore(); const queue = new Queue();
    const runtime = new ProductionAtlasRuntime(store, queue, new AtlasOrchestrator([skill]));
    await runtime.submit("rt-complete", context, steps);
    await runtime.execute("rt-complete", "run-complete", context, steps);

    await expect(runtime.resumeAfterApproval("rt-complete", "run-complete", context, steps)).rejects.toThrow("Runtime is not awaiting approval");
  });
});
