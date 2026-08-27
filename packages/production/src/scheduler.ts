export interface ScheduledJob { id: string; type: string; runAt: string; payload: unknown; }
export interface SchedulerStore { enqueue(job: ScheduledJob): Promise<void>; due(now: string, limit: number): Promise<ScheduledJob[]>; markDispatched(id: string): Promise<void>; }

export class ProductionScheduler {
  constructor(private readonly store: SchedulerStore) {}
  schedule(job: ScheduledJob) { return this.store.enqueue(job); }
  async dispatchDue(now = new Date().toISOString(), limit = 20) {
    const jobs = await this.store.due(now, limit);
    for (const job of jobs) await this.store.markDispatched(job.id);
    return jobs;
  }
}
