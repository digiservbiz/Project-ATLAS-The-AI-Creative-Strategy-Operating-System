import { describe, expect, it } from "vitest";
import { projectIntelligenceToSemantic } from "./semantic-intelligence-projector.js";
import type { PersistenceEnvelope } from "./persistence-contract.js";

describe("intelligence semantic projection", () => {
  it("projects intelligence records with tenant and provenance metadata", async () => {
    let indexed: unknown;
    const service = {
      index: async (object: unknown) => { indexed = object; },
    } as never;

    const record: PersistenceEnvelope = {
      id: "learning-1",
      businessId: "business-1",
      entityType: "learning",
      version: 3,
      data: { lesson: "hook A outperformed hook B" },
      evidenceIds: ["perf-1"],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    };

    await projectIntelligenceToSemantic(service, record, {
      organizationId: "org-1",
      projectId: "project-1",
      sourceId: "source-1",
      businessId: "business-1",
    });

    expect(indexed).toMatchObject({
      id: "intelligence:learning:learning-1",
      organizationId: "org-1",
      projectId: "project-1",
      objectType: "memory",
      sourceId: "source-1",
      metadata: {
        businessId: "business-1",
        entityType: "learning",
        recordId: "learning-1",
        version: 3,
        evidenceIds: ["perf-1"],
      },
    });
  });
});
