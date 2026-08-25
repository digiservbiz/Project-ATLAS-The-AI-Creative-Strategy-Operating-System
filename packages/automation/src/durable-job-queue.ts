export interface Job<T = unknown> { id: string; type: string; payload: T; attempts: number; maxAttempts: number; runAt: number; status: "queued" | "running" | "completed" | "failed"; }
export interface JobStore { enqueue<T>(job: Job<T>): Promise<void>; claim(now: number): Promise<Job | null>; complete(id: string): Promise<void>; fail(id: string, error: string, retryAt?: number): Promise<void>; }

export class InMemoryDurableJobStore implements JobStore {
  private jobs = new Map<string, Job>();
  async enqueue<T>(job: Job<T>) { this.jobs.set(job.id, job); }
  async claim(now: number) {
    const job = [...this.jobs.values()].find((j) => j.status === "queued" && j.runAt <= now);
    if (!job) return null;
    job.status = "running"; job.attempts += 1; return { ...job };
  }
  async complete(id: string) { const job = this.jobs.get(id); if (job) job.status = "completed"; }
  async fail(id: string, error: string, retryAt = Date.now()) { const job = this.jobs.get(id); if (!job) return; job.status = job.attempts < job.maxAttempts ? "queued" : "failed"; job.runAt = retryAt; job.payload = { ...(job.payload as object), error } as typeof job.payload; }
}

export class DurableWorker {
  constructor(private readonly store: JobStore, private readonly handlers: Record<string, (job: Job) => Promise<void>>) {}
  async tick(now = Date.now()) {
    const job = await this.store.claim(now); if (!job) return false;
    try { const handler = this.handlers[job.type]; if (!handler) throw new Error(`No handler for job type ${job.type}`); await handler(job); await this.store.complete(job.id); }
    catch (error) { await this.store.fail(job.id, error instanceof Error ? error.message : String(error), Date.now() + this.backoff(job.attempts)); }
    return true;
  }
  private backoff(attempt: number) { return Math.min(300_000, 1_000 * 2 ** Math.max(0, attempt - 1)); }
}
