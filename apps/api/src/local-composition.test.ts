import assert from "node:assert/strict";
import test from "node:test";
import {
  buildIntelligenceSnapshot,
  createBusinessIntelligenceModel,
  createStrategicState,
} from "@atlas/intelligence";
import { createLocalAtlasComposition } from "./local-composition.js";

function snapshotFor(businessId: string, name: string) {
  const model = createBusinessIntelligenceModel({
    business: {
      id: businessId,
      name,
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
  });
  return buildIntelligenceSnapshot(model, createStrategicState(model, "Find the next creative test"));
}

test("local composition runs product -> strategy -> execution -> performance -> learning", async () => {
  const composition = createLocalAtlasComposition();
  const snapshot = snapshotFor("business-local-1", "Local Demo Business");

  const result = await composition.application.runAutonomous({
    tenant: { organizationId: "org-local", projectId: "project-local" },
    input: {
      runId: "beast-local",
      productUrl: "https://example.local/product",
      objective: "Create and learn from a creative test",
      organizationId: "org-local",
      projectId: "project-local",
      snapshot,
    },
    options: {
      maxIterations: 2,
      nextPerformance: async () => ({
        creativeId: "creative-local-1",
        businessId: "business-local-1",
        platform: "meta",
        period: { start: "2026-09-01", end: "2026-09-02" },
        impressions: 5000,
        clicks: 250,
        spend: 100,
        conversions: 12,
        revenue: 500,
      }),
    },
  });

  assert.equal(result.iterations.length, 2);
  assert.equal(result.stopReason, "max_iterations");
  assert.equal(result.finalSnapshot.state.businessId, "business-local-1");
  assert.ok(result.finalSnapshot.state.knownLearnings.length >= 1);
  assert.ok(result.iterations[0]?.performance?.learning);
  assert.equal(result.iterations[0]?.workflow.status, "completed");
});

test("local composition preserves tenant input boundary", async () => {
  const composition = createLocalAtlasComposition();
  const snapshot = snapshotFor("business-local-2", "Boundary Business");

  await assert.rejects(
    composition.application.runAutonomous({
      tenant: { organizationId: "org-a" },
      input: {
        runId: "boundary",
        productUrl: "https://example.local/product",
        organizationId: "org-b",
        snapshot,
      },
    }),
    /organizationId does not match autonomous run input/,
  );
});
