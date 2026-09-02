import { describe, expect, it, vi } from "vitest";
import { PostgresBusinessModelLoader } from "./postgres-business-model-loader";

const context = { organizationId: "org-1", projectId: "project-1", objective: "launch", inputs: {}, memory: {} };

describe("PostgresBusinessModelLoader", () => {
  it("loads only the requested tenant/project and maps the canonical model", async () => {
    const query = vi.fn()
      .mockResolvedValueOnce([{
        id: "business-1", name: "Acme", model: "ecommerce", description: "Store",
        markets: ["US"], channels: ["meta"],
        audiences: [{ id: "aud-1", name: "Buyers", problems: ["price"], desires: ["value"], objections: ["trust"] }],
        competitors: [{ id: "comp-1", name: "Rival", positioning: "premium" }],
      }])
      .mockResolvedValueOnce([{ id: "brand-1", name: "Acme", positioning: "value" }])
      .mockResolvedValueOnce([{ id: "product-1", name: "Widget", description: "Useful widget", price: "29.99", currency: "USD", features: [], benefits: [], known_objections: [] }])
      .mockResolvedValueOnce([{ id: "campaign-1", channel: "meta", objective: "sales", product_id: "product-1", audience_ids: ["aud-1"] }]);

    const model = await new PostgresBusinessModelLoader({ query } as any).load(context);

    expect(model).toMatchObject({
      business: { id: "business-1", name: "Acme", model: "ecommerce", markets: ["US"], channels: ["meta"] },
      brands: [{ id: "brand-1", businessId: "business-1" }],
      offers: [{ id: "product-1", businessId: "business-1", price: 29.99 }],
      audiences: [{ id: "aud-1", businessId: "business-1" }],
      competitors: [{ id: "comp-1", businessId: "business-1" }],
      campaigns: [{ id: "campaign-1", businessId: "business-1", offerId: "product-1", audienceIds: ["aud-1"] }],
    });
    expect(query).toHaveBeenNthCalledWith(1, expect.any(String), ["project-1", "org-1", "project-1"]);
    expect(query).toHaveBeenNthCalledWith(2, expect.any(String), ["org-1", "project-1"]);
    expect(query).toHaveBeenNthCalledWith(3, expect.any(String), ["org-1", "project-1"]);
    expect(query).toHaveBeenNthCalledWith(4, expect.any(String), ["org-1", "project-1"]);
  });

  it("falls back to a tenant-scoped project when no profile exists", async () => {
    const query = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "project-1", name: "Project" }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const model = await new PostgresBusinessModelLoader({ query } as any).load(context);

    expect(model?.business).toMatchObject({ id: "project-1", name: "Project", model: "other" });
    expect(query).toHaveBeenNthCalledWith(2, expect.any(String), ["project-1", "org-1"]);
  });

  it("requires a project id before accessing production intelligence", async () => {
    await expect(new PostgresBusinessModelLoader({ query: vi.fn() } as any).load({ ...context, projectId: undefined }))
      .rejects.toThrow("projectId is required for production intelligence");
  });

  it("returns null for an unknown tenant/project", async () => {
    const query = vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    await expect(new PostgresBusinessModelLoader({ query } as any).load(context)).resolves.toBeNull();
  });
});
