export interface IngestionJob { id: string; provider: "meta" | "tiktok" | "shopify"; accountId: string; intervalMs: number; enabled: boolean; }
export interface IngestionRunner { run(job: IngestionJob): Promise<void>; }

export class ScheduledIngestionScheduler {
  private timers = new Map<string, ReturnType<typeof setInterval>>();
  constructor(private readonly runner: IngestionRunner) {}
  start(job: IngestionJob) {
    if (!job.enabled || this.timers.has(job.id)) return;
    const run = () => this.runner.run(job).catch(() => undefined);
    void run();
    this.timers.set(job.id, setInterval(run, job.intervalMs));
  }
  stop(jobId: string) { const timer = this.timers.get(jobId); if (timer) clearInterval(timer); this.timers.delete(jobId); }
  stopAll() { for (const id of this.timers.keys()) this.stop(id); }
}
