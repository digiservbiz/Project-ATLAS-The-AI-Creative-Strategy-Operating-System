import type { Database } from "./index";

export interface DurableJobRow { id: string; job_type: string; payload: Record<string, unknown>; status: "queued" | "running" | "completed" | "failed"; attempts: number; max_attempts: number; run_at: string; }

export class PostgresJobStore {
  constructor(private readonly db: Database) {}

  async enqueue(job: { id: string; type: string; payload: unknown; maxAttempts: number; runAt: number }) {
    await this.db.query(`INSERT INTO atlas_jobs(id, job_type, payload, status, max_attempts, run_at) VALUES ($1,$2,$3::jsonb,'queued',$4,to_timestamp($5/1000.0)) ON CONFLICT (id) DO NOTHING`, [job.id, job.type, JSON.stringify(job.payload), job.maxAttempts, job.runAt]);
  }

  async claim(workerId: string, now = Date.now()): Promise<DurableJobRow | null> {
    const rows = await this.db.query<DurableJobRow>(`UPDATE atlas_jobs SET status='running', locked_at=now(), locked_by=$1, attempts=attempts+1, updated_at=now() WHERE id=(SELECT id FROM atlas_jobs WHERE status='queued' AND run_at <= to_timestamp($2/1000.0) ORDER BY run_at FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING id, job_type, payload, status, attempts, max_attempts, run_at`, [workerId, now]);
    return rows[0] ?? null;
  }

  async complete(id: string) { await this.db.query(`UPDATE atlas_jobs SET status='completed', updated_at=now() WHERE id=$1`, [id]); }
  async fail(id: string, error: string, retryAt: number, terminal: boolean) { await this.db.query(`UPDATE atlas_jobs SET status=$4, last_error=$2, run_at=to_timestamp($3/1000.0), locked_at=NULL, locked_by=NULL, updated_at=now() WHERE id=$1`, [id, error, retryAt, terminal ? "failed" : "queued"]); }
}
