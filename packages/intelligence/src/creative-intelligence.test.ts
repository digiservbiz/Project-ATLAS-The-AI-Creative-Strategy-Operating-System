import { describe, expect, it } from "vitest";
import { AuthorizedCreativeSourceRegistry, DeterministicCreativeIntelligence } from "./creative-intelligence.js";

const source = { source: "authorized_custom" as const, sourceId: "ad-1", capturedAt: "2026-01-01T00:00:00.000Z", platform: "meta" as const };

describe("CCIE", () => {
  it("groups creative evidence into explainable concepts", () => {
    const engine = new DeterministicCreativeIntelligence();
    const insights = engine.analyze([
      { id: "1", organizationId: "org-1", source, headline: "Solve your checkout pain faster", callToAction: "Shop Now" },
      { id: "2", organizationId: "org-1", source: { ...source, sourceId: "ad-2" }, headline: "Save time and get results faster" },
    ]);

    expect(insights.map((x) => x.concept)).toContain("problem-solution");
    expect(insights[0].evidenceIds.length).toBeGreaterThan(0);
    expect(insights[0].caveats[0]).toContain("does not prove performance");
  });

  it("enforces organization scope on authorized source results", async () => {
    const registry = new AuthorizedCreativeSourceRegistry();
    registry.register({
      source: "authorized_custom",
      search: async () => [
        { id: "allowed", organizationId: "org-1", source, headline: "A" },
        { id: "foreign", organizationId: "org-2", source, headline: "B" },
      ],
    });

    const results = await registry.search({ organizationId: "org-1", source: "authorized_custom", limit: 10 });
    expect(results.map((x) => x.id)).toEqual(["allowed"]);
  });

  it("rejects missing organization scope", async () => {
    const registry = new AuthorizedCreativeSourceRegistry();
    await expect(registry.search({ organizationId: "", source: "authorized_custom" })).rejects.toThrow("CREATIVE_SCOPE_REQUIRED");
  });
});
