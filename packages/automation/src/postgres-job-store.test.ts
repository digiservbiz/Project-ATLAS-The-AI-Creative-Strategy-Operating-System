import { describe, expect, it } from "vitest";
import { PostgresJobStore } from "./postgres-job-store";

describe("PostgresJobStore", () => {
  it("uses an atomic skip-locked claim", async () => {
    const calls: string[] = [];
    const db = { query: async <T = unknown>(sql: string) => { calls.push(sql); return { rows: [] as T[] }; } };
    const store = new PostgresJobStore(db);
    await store.claim(1000);
    expect(calls[0]).toContain("FOR UPDATE SKIP LOCKED");
    expect(calls[0]).toContain("status='running'");
  });

  it("recovers expired worker leases", async () => {
    const calls: string[] = [];
    const db = { query: async <T = unknown>(sql: string) => { calls.push(sql); return { rows: [] as T[] }; } };
    await new PostgresJobStore(db).recoverExpired(2000);
    expect(calls[0]).toContain("lease_until < $1");
  });
});
