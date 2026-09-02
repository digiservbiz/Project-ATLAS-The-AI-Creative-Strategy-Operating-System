import type { AgentContext, WorkflowStep } from "@atlas/orchestrator";
import { ProductionAtlasRuntime } from "@atlas/runtime";
import type { Job, JobStore } from "./durable-job-queue";
import type { ProductionIntelligenceContextLoader } from "./intelligence-context-loader";

export interface WorkflowJobPayload { runtimeId: string; runId: string; context: AgentContext; steps: WorkflowStep[]; }

export class ProductionWorkflowWorker {
  constructor(
    private readonly store: JobStore,
    private readonly runtime: ProductionAtlasRuntime,
    private readonly intelligenceContextLoader?: ProductionIntelligenceContextLoader,
  ) {}

  async tick(now = Date.now()): Promise<boolean> {
    const job = await this.store.claim(now);
    if (!job) return false;
    try {
      if (job.type !== "workflow.run") throw new Error(`Unsupported production job type: ${job.type}`);
      const payload = job.payload as WorkflowJobPayload;
      const context = this.intelligenceContextLoader
        ? await this.intelligenceContextLoader.enrich(payload.context)
        : payload.context;
      await this.runtime.execute(payload.runtimeId, payload.runId, context, payload.steps);
      await this.store.complete(job.id);
    } catch (error) {
      await this.store.fail(job.id, error instanceof Error ? error.message : String(error), Date.now() + this.retryDelay(job.attempts));
    }
    return true;
  }

  async drain(now = Date.now(), maxJobs = 100) {
    let processed = 0;
    while (processed < maxJobs && await this.tick(now)) processed += 1;
    return processed;
  }

  private retryDelay(attempt: number) { return Math.min(300_000, 1_000 * 2 ** Math.max(0, attempt - 1)); }
}
