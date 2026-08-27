import { AtlasOrchestrator, type AgentContext, type WorkflowRun, type WorkflowStep } from "@atlas/orchestrator";

export type RuntimeStatus = "queued" | "running" | "awaiting_approval" | "completed" | "failed";

export interface RuntimeRecord {
  id: string;
  status: RuntimeStatus;
  workflow: WorkflowRun | null;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface RuntimeStore {
  get(id: string): Promise<RuntimeRecord | null>;
  save(record: RuntimeRecord): Promise<void>;
}

export interface RuntimeJobQueue {
  enqueue(job: { id: string; type: "workflow.run"; runtimeId: string; runId: string; context: AgentContext; steps: WorkflowStep[] }): Promise<void>;
}

export class ProductionAtlasRuntime {
  constructor(private readonly store: RuntimeStore, private readonly queue: RuntimeJobQueue, private readonly orchestrator: AtlasOrchestrator) {}

  async submit(id: string, context: AgentContext, steps: WorkflowStep[]): Promise<RuntimeRecord> {
    const existing = await this.store.get(id);
    if (existing && ["queued", "running", "awaiting_approval"].includes(existing.status)) return existing;
    const now = new Date().toISOString();
    const record: RuntimeRecord = { id, status: "queued", workflow: null, createdAt: now, updatedAt: now };
    await this.store.save(record);
    await this.queue.enqueue({ id: `workflow:${id}`, type: "workflow.run", runtimeId: id, runId: `run:${id}`, context, steps });
    return record;
  }

  async execute(runtimeId: string, runId: string, context: AgentContext, steps: WorkflowStep[]): Promise<RuntimeRecord> {
    const current = await this.store.get(runtimeId);
    if (!current) throw new Error(`Runtime not found: ${runtimeId}`);
    const started = { ...current, status: "running" as RuntimeStatus, updatedAt: new Date().toISOString() };
    await this.store.save(started);
    try {
      const workflow = await this.orchestrator.run(runId, context, steps);
      const awaiting = Object.values(workflow.outputs).some((result) => result.requiresApproval);
      const status: RuntimeStatus = awaiting ? "awaiting_approval" : workflow.status === "failed" ? "failed" : "completed";
      const done = { ...started, status, workflow, updatedAt: new Date().toISOString() };
      await this.store.save(done);
      return done;
    } catch (error) {
      const failed = { ...started, status: "failed" as RuntimeStatus, error: error instanceof Error ? error.message : String(error), updatedAt: new Date().toISOString() };
      await this.store.save(failed);
      return failed;
    }
  }
}
