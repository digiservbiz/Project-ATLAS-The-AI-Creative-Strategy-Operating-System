import test from "node:test";
import assert from "node:assert/strict";
import { createAtlasApplication } from "./application.js";

test("application rejects missing organization scope", () => {
  const app = createAtlasApplication();
  assert.throws(
    () => app.getIntelligenceActions({ tenant: { organizationId: "" }, signals: {} }),
    /organizationId is required/,
  );
});

test("application accepts a tenant and produces intelligence actions", () => {
  const app = createAtlasApplication();
  const actions = app.getIntelligenceActions({
    tenant: { organizationId: "org-1", projectId: "project-1" },
    signals: { fatigueScore: 0.9 },
  });
  assert.ok(Array.isArray(actions));
  assert.ok(actions.length > 0);
});
