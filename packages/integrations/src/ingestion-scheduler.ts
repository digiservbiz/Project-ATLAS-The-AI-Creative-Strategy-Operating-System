export interface IngestionJob { id: string; platform: string; accountId: string; intervalMs: number; enabled: boolean; lastRunAt?: string; }
export interface IngestionRunner { run(job: IngestionJob): Promise<void>; }

export class IngestionScheduler {
  private readonly timers = new Map<string, ReturnType<typeof setInterval>>();
  constructor(private readonly runner: IngestionRunner) {}
  start(job: IngestionJob) {
    this.stop(job.id);
    if (!job.enabled || job.intervalMs <= 0) return;
    const timer = setInterval(() => void this.runner.run(job).catch(() => undefined), job.intervalMs);
    this.timers.set(job.id, timer);
    void this.runner.run(job).catch(() => undefined);
  }
  stop(jobId: string) { const timer = this.timers.get(jobId); if (timer) clearInterval(timer); this.timers.delete(jobId); }
  stopAll() { for (const id of this.timers.keys()) this.stop(id); }
}
