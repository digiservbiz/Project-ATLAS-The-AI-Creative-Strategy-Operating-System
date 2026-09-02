import { describe, expect, it, vi } from "vitest";
import { ScopedPersistentIntelligenceService } from "./scoped-persistent-intelligence";

const model = {
  business: { id: "business-1", name: "Acme", model: "ecommerce", markets: [], channels: [], brandIds: [] },
  brands: [], offers: [], audiences: [], competitors: [], campaigns: [],
};

const learning = {
  id: "learning-1", businessId: "business-1", evidenceIds: [], createdAt: new Date().toISOString(),
  summary: "Test learning", confidence: 0.8, implications: [], source: "experiment",
} as any;

describe("ScopedPersistentIntelligenceService", () => {
  it("creates an isolated persistence service for each scope", async () => {
    const first = { get: vi.fn().mockResolvedValue(null), put: vi.fn(), list: vi.fn() };
    const second = { get: vi.fn().mockResolvedValue(null), put: vi.fn(), list: vi.fn() };
    const factory = vi.fn()
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second);
    const service = new ScopedPersistentIntelligenceService({ repositoryFactory: factory });

    await service.loadSnapshot({ organizationId: "org-1", projectId: "project-1" }, model, "launch");
    await service.loadSnapshot({ organizationId: "org-2", projectId: "project-2" }, model, "launch");

    expect(factory).toHaveBeenNthCalledWith(1, { organizationId: "org-1", projectId: "project-1" });
    expect(factory).toHaveBeenNthCalledWith(2, { organizationId: "org-2", projectId: "project-2" });
    expect(first.get).toHaveBeenCalled();
    expect(second.get).toHaveBeenCalled();
  });

  it("rejects incomplete scopes before repository creation", () => {
    const factory = vi.fn();
    const service = new ScopedPersistentIntelligenceService({ repositoryFactory: factory });
    expect(() => service.forScope({ organizationId: "", projectId: "project-1" })).toThrow("organizationId is required");
    expect(() => service.forScope({ organizationId: "org-1", projectId: "" })).toThrow("projectId is required");
    expect(factory).not.toHaveBeenCalled();
  });

  it("routes learning persistence through the requested tenant scope", async () => {
    const repository = { get: vi.fn().mockResolvedValue(null), put: vi.fn().mockResolvedValue(undefined), list: vi.fn() };
    const factory = vi.fn().mockReturnValue(repository);
    const service = new ScopedPersistentIntelligenceService({ repositoryFactory: factory });

    await service.recordLearning({ organizationId: "org-1", projectId: "project-1" }, learning);

    expect(factory).toHaveBeenCalledWith({ organizationId: "org-1", projectId: "project-1" });
    expect(repository.put).toHaveBeenCalledWith(expect.objectContaining({ businessId: "business-1", entityType: "learning" }));
  });
});
