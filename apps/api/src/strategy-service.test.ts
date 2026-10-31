import assert from "node:assert/strict";
import test from "node:test";
import type { ModelProvider } from "@atlas/model-gateway";
import { generateStrategy } from "./strategy-service.js";

const strategy = {
  primaryAngle: "More family time, less preparation",
  messageContinuity: "Demonstrate the time-saving benefit consistently.",
  proofFirst: true,
  angles: [
    { name: "Time saved", premise: "Show the preparation process and duration." },
    { name: "Ease", premise: "Demonstrate the simplest common use case." },
    { name: "Routine", premise: "Show how the product fits a busy family routine." },
  ],
};

const input = {
  organizationId: "org-test",
  projectId: "project-test",
  productBrief: {
    productName: "Kitchen helper",
    customerProblem: "meal preparation takes too long",
    audience: "busy families",
  },
};

test("generates a tenant-scoped strategy through the agent runtime and keeps it under review", async () => {
  const provider: ModelProvider = {
    providerId: "test",
    async generate(request) {
      assert.equal(request.model, "test-model");
      assert.match(request.input, /meal preparation takes too long/);
      return { text: JSON.stringify(strategy), provider: "test", model: "test-model" };
    },
  };

  const result = await generateStrategy(input, {
    apiKey: "test-key",
    model: "test-model",
    provider,
  });

  assert.equal(result.status, "needs_review");
  assert.deepEqual(result.result.strategy, strategy);
  assert.equal(result.result.reviewRequired, true);
  assert.ok(result.warnings.some((warning) => warning.includes("HUMAN_REVIEW_REQUIRED")));
});

test("rejects missing tenant scope before calling a model", async () => {
  let called = false;
  const provider: ModelProvider = {
    providerId: "test",
    async generate() {
      called = true;
      return { text: JSON.stringify(strategy), provider: "test", model: "test-model" };
    },
  };

  await assert.rejects(
    generateStrategy({ ...input, organizationId: " " }, {
      apiKey: "test-key",
      model: "test-model",
      provider,
    }),
    /TENANT_SCOPE_REQUIRED/,
  );
  assert.equal(called, false);
});

test("rejects an empty product brief before calling a model", async () => {
  let called = false;
  const provider: ModelProvider = {
    providerId: "test",
    async generate() {
      called = true;
      return { text: JSON.stringify(strategy), provider: "test", model: "test-model" };
    },
  };

  await assert.rejects(
    generateStrategy({ ...input, productBrief: " " }, {
      apiKey: "test-key",
      model: "test-model",
      provider,
    }),
    /PRODUCT_BRIEF_REQUIRED/,
  );
  assert.equal(called, false);
});
