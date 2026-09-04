import { describe, expect, it } from "vitest";
import { ResearchIntelligenceService, type ResearchFinding, type ResearchSourceAdapter } from "./research-ingestion";

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
