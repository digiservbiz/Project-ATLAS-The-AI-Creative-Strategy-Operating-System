import type { AgentContext, WorkflowStep } from "@atlas/orchestrator";
import type { Job, JobStore } from "./durable-job-queue";
import { DurableWorker } from "./durable-job-queue";

export interface RuntimeExecutor {
  execute(runtimeId: string, runId: string, context: AgentContext, steps: WorkflowStep[]): Promise<unknown>;
}

export interface WorkflowJobPayload {
  runtimeId: string;
  runId: string;
  context: AgentContext;
  steps: WorkflowStep[];
}

export function createRuntimeWorker(store: JobStore, executor: RuntimeExecutor) {
  return new DurableWorker(store, {
    "workflow.run": async (job: Job<WorkflowJobPayload>) => {
      await executor.execute(job.payload.runtimeId, job.payload.runId, job.payload.context, job.payload.steps);
    },
  });
}

export class WorkerLoop {
  private stopped = false;
  constructor(private readonly worker: DurableWorker, private readonly pollMs = 1000) {}

  start() {
    this.stopped = false;
    const loop = async () => {
      while (!this.stopped) {
        const processed = await this.worker.tick();
        if (!processed) await new Promise((resolve) => setTimeout(resolve, this.pollMs));
      }
    };
    return loop();
  }

  stop() { this.stopped = true; }
}
