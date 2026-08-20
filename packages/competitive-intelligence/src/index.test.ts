import { describe, expect, it, vi } from "vitest";
import type { CreativeArtifact, CreativeSourceAdapter } from "@atlas/contracts";
import { CompetitiveCreativeIntelligenceService } from "./index";

const artifact = (id: string, sourceId = id): CreativeArtifact => ({
  id,
  organizationId: "org-1",
  source: {
    source: "authorized_custom",
    sourceId,
    capturedAt: "2026-08-20T00:00:00Z",
    platform: "meta",
  },
  primaryText: "No drilling required",
  callToAction: "Shop Now",
});

describe("CompetitiveCreativeIntelligenceService", () => {
  it("ingests, deduplicates, persists and indexes artifacts", async () => {
    const adapter: CreativeSourceAdapter = {
      source: "authorized_custom",
      search: vi.fn(async () => [artifact("a"), artifact("a")]),
    };
    const store = {
      upsert: vi.fn(async () => undefined),
      findBySource: vi.fn(async () => null),
    };
    const indexer = { index: vi.fn(async () => undefined) };

    const service = new CompetitiveCreativeIntelligenceService([adapter], store, indexer);
    const result = await service.ingestAndIndex({ organizationId: "org-1", source: "authorized_custom" });

    expect(result.inserted).toBe(1);
    expect(store.upsert).toHaveBeenCalledTimes(1);
    expect(indexer.index).toHaveBeenCalledTimes(1);
  });

  it("reports updates when an artifact already exists", async () => {
    const existing = artifact("a");
    const adapter: CreativeSourceAdapter = {
      source: "authorized_custom",
      search: vi.fn(async () => [existing]),
    };
    const store = {
      upsert: vi.fn(async () => undefined),
      findBySource: vi.fn(async () => existing),
    };

    const service = new CompetitiveCreativeIntelligenceService([adapter], store);
    const result = await service.ingestAndIndex({ organizationId: "org-1", source: "authorized_custom" });

    expect(result.updated).toBe(1);
    expect(result.inserted).toBe(0);
  });
});
