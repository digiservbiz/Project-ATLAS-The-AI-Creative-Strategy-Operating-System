import { describe, expect, it } from "vitest";
import { ResearchIntelligenceService, type ResearchFinding, type ResearchFindingStore, type ResearchSourceAdapter } from "./research-ingestion";

const finding = (id: string, sourceId = id): ResearchFinding => ({
  id,
  organizationId: "org-1",
  projectId: "project-1",
  title: "  Customer insight  ",
  content: "  Customers want a faster solution.  ",
  sourceType: "community",
  provenance: { sourceType: "community", sourceId, retrievedAt: "2026-09-04T00:00:00.000Z" },
  evidenceStrength: "medium",
  tags: ["Pain Point", "pain point", ""],
});

class RecordingStore implements ResearchFindingStore {
  lookups: Array<[string, string, string, string]> = [];
  saved: ResearchFinding[] = [];

  async findBySource(organizationId: string, projectId: string, sourceType: ResearchFinding["sourceType"], sourceId: string) {
    this.lookups.push([organizationId, projectId, sourceType, sourceId]);
    return null;
  }

  async upsert(item: ResearchFinding) { this.saved.push(item); }
}

describe("ResearchIntelligenceService", () => {
  it("normalizes, deduplicates, persists and indexes research findings", async () => {
    const adapter: ResearchSourceAdapter = {
      sourceType: "community",
      async search() { return [finding("1"), finding("1"), finding("2")]; },
    };
    const saved: ResearchFinding[] = [];
    const indexed: ResearchFinding[] = [];
    const service = new ResearchIntelligenceService(
      [adapter],
      {
        async findBySource() { return null; },
        async upsert(item) { saved.push(item); },
      },
      { async index(item) { indexed.push(item); } },
    );

    const result = await service.ingestAndIndex({
      organizationId: "org-1", projectId: "project-1", query: "customer pain points", source: "community",
    });

    expect(result.inserted).toBe(2);
    expect(result.findings).toHaveLength(2);
    expect(saved).toHaveLength(2);
    expect(indexed).toHaveLength(2);
    expect(result.findings[0].title).toBe("Customer insight");
    expect(result.findings[0].tags).toEqual(["pain point"]);
  });

  it("passes tenant scope into every persistence lookup", async () => {
    const store = new RecordingStore();
    const service = new ResearchIntelligenceService([
      { sourceType: "review", async search() { return [{ ...finding("review-1"), sourceType: "review", provenance: { ...finding("review-1").provenance, sourceType: "review" } }]; } },
    ], store);

    await service.ingest({ organizationId: "org-1", projectId: "project-1", query: "reviews", source: "review" });

    expect(store.lookups).toEqual([["org-1", "project-1", "review", "review-1"]]);
  });

  it("keeps identical source ids isolated between tenants", async () => {
    const store = new RecordingStore();
    const service = new ResearchIntelligenceService([
      {
        sourceType: "community",
        async search(query) {
          return [{ ...finding(query.organizationId), organizationId: query.organizationId, projectId: query.projectId, provenance: { ...finding("shared").provenance, sourceId: "shared" } }];
        },
      },
    ], store);

    await service.ingest({ organizationId: "org-1", projectId: "project-1", query: "same" });
    await service.ingest({ organizationId: "org-2", projectId: "project-2", query: "same" });

    expect(store.lookups).toEqual([
      ["org-1", "project-1", "community", "shared"],
      ["org-2", "project-2", "community", "shared"],
    ]);
  });

  it("rejects findings from another tenant", async () => {
    const adapter: ResearchSourceAdapter = {
      sourceType: "review",
      async search() { return [{ ...finding("bad"), organizationId: "other-org", sourceType: "review", provenance: { ...finding("bad").provenance, sourceType: "review" } }]; },
    };
    const service = new ResearchIntelligenceService([adapter]);
    await expect(service.ingest({ organizationId: "org-1", projectId: "project-1", query: "reviews", source: "review" }))
      .rejects.toThrow("tenant scope mismatch");
  });
});
