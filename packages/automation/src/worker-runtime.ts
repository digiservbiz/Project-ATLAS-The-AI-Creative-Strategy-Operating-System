import { DurableWorker, type Job, type JobStore } from "./durable-job-queue";
import { PostgresJobStore } from "./postgres-job-store";
import { ProductionAtlasRuntime } from "@atlas/runtime";

export interface WorkflowJobPayload { runtimeId: string; runId: string; context: any; steps: any[] }

export class AtlasWorkflowWorker {
  private readonly worker: DurableWorker;
  constructor(private readonly store: JobStore, runtime: ProductionAtlasRuntime) {
    this.worker = new DurableWorker(store, {
      "workflow.run": async (job: Job<WorkflowJobPayload>) => {
        await runtime.execute(job.payload.runtimeId, job.payload.runId, job.payload.context, job.payload.steps);
      },
    });
  }
  tick(now = Date.now()) { return this.worker.tick(now); }
}

export function createPostgresWorker(db: ConstructorParameters<typeof PostgresJobStore>[0], runtime: ProductionAtlasRuntime) {
  const store = new PostgresJobStore(db);
  return { store, worker: new AtlasWorkflowWorker(store, runtime) };
}
