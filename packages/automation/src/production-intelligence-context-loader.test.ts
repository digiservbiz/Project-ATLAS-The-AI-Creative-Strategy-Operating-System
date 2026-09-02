import { describe, expect, it } from "vitest";
import type { AgentContext } from "@atlas/orchestrator";
import type { BusinessIntelligenceModel, IntelligenceSnapshot, PersistentIntelligenceService } from "@atlas/intelligence";
import { PersistentProductionIntelligenceContextLoader, type ProductionBusinessModelLoader } from "./intelligence-context-loader";

const context: AgentContext = {
  organizationId: "org-1", projectId: "project-1", objective: "improve creative",
  inputs: {}, memory: { existing: "value" },
};

const model: BusinessIntelligenceModel = {
  business: { id: "business-1", name: "Acme", model: "ecommerce", markets: ["US"], channels: ["meta"], brandIds: [] },
  brands: [], offers: [], audiences: [], competitors: [], campaigns: [],
};

const snapshot = {
  business: { business: model.business, brands: [], offers: [], audiences: [], competitors: [], campaigns: [] },
  state: { businessId: "business-1", confidence: 0.9 }, nextBestActions: [],
} as unknown as IntelligenceSnapshot;

describe("PersistentProductionIntelligenceContextLoader", () => {
  it("hydrates context with the persisted intelligence snapshot", async () => {
    let loadedContext: AgentContext | undefined;
    const loader: ProductionBusinessModelLoader = { async load(input) { loadedContext = input; return model; } };
    const intelligence = { async loadSnapshot(input: BusinessIntelligenceModel, objective?: string) {
      expect(input).toBe(model); expect(objective).toBe(context.objective); return snapshot;
    } } as unknown as PersistentIntelligenceService;
    const enriched = await new PersistentProductionIntelligenceContextLoader(loader, intelligence).enrich(context);
    expect(loadedContext).toBe(context);
    expect(enriched).not.toBe(context);
    expect(enriched.memory.existing).toBe("value");
    expect(enriched.memory.intelligenceSnapshot).toBe(snapshot);
  });

  it("returns the original context when no business model is available", async () => {
    const loader: ProductionBusinessModelLoader = { async load() { return null; } };
    const intelligence = { async loadSnapshot() { throw new Error("must not load"); } } as unknown as PersistentIntelligenceService;
    await expect(new PersistentProductionIntelligenceContextLoader(loader, intelligence).enrich(context)).resolves.toBe(context);
  });

  it("rejects a cross-business snapshot before it reaches an agent", async () => {
    const loader: ProductionBusinessModelLoader = { async load() { return model; } };
    const intelligence = { async loadSnapshot() {
      return { ...snapshot, state: { businessId: "business-2", confidence: 0.9 } };
    } } as unknown as PersistentIntelligenceService;
    await expect(new PersistentProductionIntelligenceContextLoader(loader, intelligence).enrich(context))
      .rejects.toThrow("business/state scope mismatch");
  });
});
