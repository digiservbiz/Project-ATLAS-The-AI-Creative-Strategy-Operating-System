import { AtlasOrchestrator } from "./index";
import type { AgentContext, WorkflowRun, WorkflowStep } from "./contracts";

export type RuntimeState = "draft" | "running" | "awaiting_approval" | "completed" | "failed";

export interface RuntimeSnapshot { id: string; state: RuntimeState; workflow: WorkflowRun | null; updatedAt: string; error?: string; }
export interface RuntimeStore { get(id: string): Promise<RuntimeSnapshot | null>; save(snapshot: RuntimeSnapshot): Promise<void>; }

export class InMemoryRuntimeStore implements RuntimeStore {
  private readonly snapshots = new Map<string, RuntimeSnapshot>();
  async get(id: string) { return this.snapshots.get(id) ?? null; }
  async save(snapshot: RuntimeSnapshot) { this.snapshots.set(snapshot.id, snapshot); }
}

export interface AtlasRuntimeInput { runId: string; context: AgentContext; steps: WorkflowStep[]; }

export class AtlasRuntime {
  constructor(private readonly orchestrator: AtlasOrchestrator, private readonly store: RuntimeStore) {}

  async start(input: AtlasRuntimeInput): Promise<RuntimeSnapshot> {
    const existing = await this.store.get(input.runId);
    if (existing?.state === "running" || existing?.state === "awaiting_approval") return existing;
    const running: RuntimeSnapshot = { id: input.runId, state: "running", workflow: null, updatedAt: new Date().toISOString() };
    await this.store.save(running);
    try {
      const workflow = await this.orchestrator.run(input.runId, input.context, input.steps);
      const state: RuntimeState = Object.values(workflow.steps).some((s) => s === "pending") ? "awaiting_approval" : workflow.status === "failed" ? "failed" : "completed";
      const snapshot = { id: input.runId, state, workflow, updatedAt: new Date().toISOString() };
      await this.store.save(snapshot);
      return snapshot;
    } catch (error) {
      const snapshot = { id: input.runId, state: "failed" as const, workflow: null, updatedAt: new Date().toISOString(), error: error instanceof Error ? error.message : String(error) };
      await this.store.save(snapshot);
      throw error;
    }
  }
}
