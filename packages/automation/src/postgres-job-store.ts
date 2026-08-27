import type { Job, JobStore } from "./durable-job-queue";

export interface SqlClient { query<T = unknown>(sql: string, params?: unknown[]): Promise<{ rows: T[] }> }

type JobRow = { id: string; type: string; payload: unknown; attempts: number; max_attempts: number; run_at: number; status: Job["status"] };

export class PostgresJobStore implements JobStore {
  constructor(private readonly db: SqlClient, private readonly leaseMs = 60_000) {}

  async enqueue<T>(job: Job<T>) {
    await this.db.query(`INSERT INTO atlas_jobs (id,type,payload,attempts,max_attempts,run_at,status) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`, [job.id, job.type, JSON.stringify(job.payload), job.attempts, job.maxAttempts, job.runAt, job.status]);
  }

  async claim(now: number) {
    const result = await this.db.query<JobRow>(`UPDATE atlas_jobs SET status='running', attempts=attempts+1, lease_until=$1 WHERE id=(SELECT id FROM atlas_jobs WHERE status='queued' AND run_at <= $2 ORDER BY run_at ASC FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING id,type,payload,attempts,max_attempts,run_at,status`, [now + this.leaseMs, now]);
    const row = result.rows[0];
    return row ? { id: row.id, type: row.type, payload: row.payload, attempts: row.attempts, maxAttempts: row.max_attempts, runAt: row.run_at, status: row.status } : null;
  }

  async complete(id: string) { await this.db.query(`UPDATE atlas_jobs SET status='completed', lease_until=NULL WHERE id=$1`, [id]); }

  async fail(id: string, error: string, retryAt = Date.now()) {
    await this.db.query(`UPDATE atlas_jobs SET status=CASE WHEN attempts < max_attempts THEN 'queued' ELSE 'failed' END, run_at=$2, lease_until=NULL, last_error=$3 WHERE id=$1`, [id, retryAt, error]);
  }

  async recoverExpired(now = Date.now()) {
    await this.db.query(`UPDATE atlas_jobs SET status='queued', lease_until=NULL WHERE status='running' AND lease_until IS NOT NULL AND lease_until < $1`, [now]);
  }
}
