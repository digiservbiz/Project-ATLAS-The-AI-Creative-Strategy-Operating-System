import { describe, expect, it, vi } from "vitest";
import type { AgentContext } from "@atlas/orchestrator";
import type { BusinessIntelligenceModel, PersistentIntelligenceService } from "@atlas/intelligence";
import { PersistentProductionIntelligenceContextLoader, type ProductionBusinessModelLoader } from "./intelligence-context-loader";

const model: BusinessIntelligenceModel = {
  business: {
    id: "business-1",
    name: "Test Business",
    model: "ecommerce",
    markets: ["US"],
    channels: ["meta"],
    brandIds: [],
  },
  brands: [],
  offers: [],
  audiences: [],
  competitors: [],
  campaigns: [],
};

const context: AgentContext = {
  organizationId: "org-1",
  projectId: "project-1",
  objective: "improve creative",
  inputs: {},
  memory: { existing: true },
};

describe("PersistentProductionIntelligenceContextLoader", () => {
  it("hydrates orchestration memory with the tenant-scoped intelligence snapshot", async () => {
    const businessLoader: ProductionBusinessModelLoader = {
      load: vi.fn(async loadedContext => {
        expect(loadedContext.organizationId).toBe("org-1");
        expect(loadedContext.projectId).toBe("project-1");
        return model;
      }),
    };
    const snapshot = {
      business: { business: { id: "business-1" } },
      state: { businessId: "business-1", confidence: 0.9 },
    } as any;
    const intelligence = {
      loadSnapshot: vi.fn(async (loadedModel, objective) => {
        expect(loadedModel).toEqual(model);
        expect(objective).toBe("improve creative");
        return snapshot;
      }),
    } as unknown as PersistentIntelligenceService;

    const loader = new PersistentProductionIntelligenceContextLoader(businessLoader, intelligence);
    const enriched = await loader.enrich(context);

    expect(enriched).not.toBe(context);
    expect(enriched.memory.existing).toBe(true);
    expect(enriched.memory.intelligenceSnapshot).toBe(snapshot);
    expect(businessLoader.load).toHaveBeenCalledTimes(1);
    expect(intelligence.loadSnapshot).toHaveBeenCalledTimes(1);
  });

  it("leaves the context unchanged when no business model is available", async () => {
    const businessLoader: ProductionBusinessModelLoader = {
      load: vi.fn(async () => null),
    };
    const intelligence = {
      loadSnapshot: vi.fn(),
    } as unknown as PersistentIntelligenceService;

    const enriched = await new PersistentProductionIntelligenceContextLoader(businessLoader, intelligence).enrich(context);

    expect(enriched).toBe(context);
    expect(intelligence.loadSnapshot).not.toHaveBeenCalled();
  });

  it("rejects a snapshot whose strategic state belongs to another business", async () => {
    const businessLoader: ProductionBusinessModelLoader = {
      load: vi.fn(async () => model),
    };
    const intelligence = {
      loadSnapshot: vi.fn(async () => ({
        business: { business: { id: "business-1" } },
        state: { businessId: "business-2" },
      })) as any,
    } as unknown as PersistentIntelligenceService;

    await expect(
      new PersistentProductionIntelligenceContextLoader(businessLoader, intelligence).enrich(context),
    ).rejects.toThrow("business/state scope mismatch");
  });
});
