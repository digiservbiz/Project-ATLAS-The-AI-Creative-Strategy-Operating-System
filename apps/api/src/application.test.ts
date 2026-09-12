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

test("application rejects autonomous input from another organization", async () => {
  const autonomousLoop = {
    run: async () => { throw new Error("should not execute"); },
  } as never;
  const app = createAtlasApplication({ autonomousLoop });
  const input = { organizationId: "org-2", projectId: "project-1" } as never;
  await assert.rejects(
    app.runAutonomous({ tenant: { organizationId: "org-1", projectId: "project-1" }, input }),
    /organizationId does not match autonomous run input/,
  );
});

test("application delegates an authorized autonomous run", async () => {
  let called = false;
  const expected = { stopReason: "completed", iterations: [], finalSnapshot: {} } as never;
  const autonomousLoop = {
    run: async () => { called = true; return expected; },
  } as never;
  const app = createAtlasApplication({ autonomousLoop });
  const input = { organizationId: "org-1", projectId: "project-1" } as never;
  const result = await app.runAutonomous({ tenant: { organizationId: "org-1", projectId: "project-1" }, input });
  assert.equal(called, true);
  assert.equal(result, expected);
});

test("application fails clearly when autonomous runtime is not configured", async () => {
  const app = createAtlasApplication();
  const input = { organizationId: "org-1" } as never;
  await assert.rejects(
    app.runAutonomous({ tenant: { organizationId: "org-1" }, input }),
    /Autonomous runtime is not configured/,
  );
});
