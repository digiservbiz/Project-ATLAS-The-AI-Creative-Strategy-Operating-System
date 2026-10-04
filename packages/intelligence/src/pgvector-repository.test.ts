import { describe, expect, it } from "vitest";
import { PgVectorSemanticRepository } from "./pgvector-repository.js";

function dbSpy() {
  const calls: Array<{ sql: string; values?: unknown[] }> = [];
  return {
    calls,
    query: async <T = unknown>(sql: string, values?: unknown[]) => {
      calls.push({ sql, values });
      return [] as T[];
    },
  } as never;
}

const selector = { provider: "local-hash", model: "atlas-local-hash", version: "1", dimensions: 3 };

describe("PgVectorSemanticRepository validation", () => {
  it("rejects malformed query vectors before database access", async () => {
    const db = dbSpy();
    const repo = new PgVectorSemanticRepository(db);

    await expect(repo.search({
      organizationId: "org-1", projectId: "project-1", query: "test", topK: 5, objectTypes: [], filters: {},
    }, [1, 2], selector)).rejects.toThrow("QUERY_VECTOR_DIMENSION_MISMATCH");

    expect(db.calls).toHaveLength(0);
  });

  it("rejects invalid topK and missing tenant scope", async () => {
    const db = dbSpy();
    const repo = new PgVectorSemanticRepository(db);

    await expect(repo.search({
      organizationId: "org-1", projectId: "project-1", query: "test", topK: 0, objectTypes: [], filters: {},
    }, [1, 2, 3], selector)).rejects.toThrow("INVALID_TOP_K");

    await expect(repo.search({
      organizationId: "", projectId: "project-1", query: "test", topK: 5, objectTypes: [], filters: {},
    }, [1, 2, 3], selector)).rejects.toThrow("TENANT_SCOPE_REQUIRED");
  });

  it("uses the selected provider/model/version and tenant in SQL", async () => {
    const db = dbSpy();
    const repo = new PgVectorSemanticRepository(db);

    await repo.search({
      organizationId: "org-1", projectId: "project-1", query: "test", topK: 5, objectTypes: ["hook"], filters: {},
    }, [1, 0, 0], selector);

    expect(db.calls).toHaveLength(1);
    expect(db.calls[0].sql).toContain("e.provider=$5");
    expect(db.calls[0].sql).toContain("e.model=$6");
    expect(db.calls[0].sql).toContain("e.version=$7");
    expect(db.calls[0].sql).toContain("e.dimensions=$8");
    expect(db.calls[0].sql).toContain("o.organization_id=$1");
    expect(db.calls[0].sql).toContain("o.project_id=$2");
  });
});
