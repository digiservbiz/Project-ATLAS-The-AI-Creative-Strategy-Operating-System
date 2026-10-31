import { describe, expect, it, vi } from "vitest";
import type { ModelProvider } from "@atlas/model-gateway";
import { createModelBackedCreativeStrategyAgent } from "./model-backed-strategy.js";

const envelope = {
  execution: {
    runId: "test-run",
    agentId: "creative-strategy-ai",
    agentVersion: "1.0.0",
    attempt: 1,
    requestedAt: "2026-10-31T08:00:00.000Z",
  },
  context: { organizationId: "org-test", projectId: "project-test" },
  task: {
    objective: "Create a differentiated creative strategy",
    constraints: ["Do not invent product claims"],
    instructions: [],
  },
  inputs: {
    productBrief: {
      productName: "Time-saving kitchen tool",
      customerProblem: "meal preparation takes too long",
      audience: "busy families",
      offer: "starter bundle",
    },
  },
  knowledge: [],
  memory: [],
  tools: [],
};

const validStrategy = {
  primaryAngle: "Less preparation, more family time",
  messageContinuity: "Connect every claim to the time-saving demonstration.",
  proofFirst: true,
  angles: [
    { name: "Time saved", premise: "Demonstrate preparation time with a clear comparison." },
    { name: "Ease of use", premise: "Show the product solving a common preparation task." },
    { name: "Family routine", premise: "Connect convenience to a calmer meal routine." },
  ],
};

function providerReturning(text: string): ModelProvider {
  return {
    providerId: "test",
    generate: vi.fn().mockResolvedValue({ text, provider: "test", model: "test-model" }),
  };
}

describe("model-backed creative strategy agent", () => {
  it("calls the explicitly selected model and returns validated strategy for review", async () => {
    const provider = providerReturning(JSON.stringify(validStrategy));
    const agent = createModelBackedCreativeStrategyAgent({ provider, model: "test-model" });

    const result = await agent.execute(envelope);

    expect(result.status).toBe("needs_review");
    expect(result.result.strategy).toEqual(validStrategy);
    expect(result.result.reviewRequired).toBe(true);
    expect(result.warnings[0]).toContain("HUMAN_REVIEW_REQUIRED");
    expect(provider.generate).toHaveBeenCalledOnce();
    expect(provider.generate).toHaveBeenCalledWith(expect.objectContaining({
      model: "test-model",
      input: expect.stringContaining("meal preparation takes too long"),
    }));
  });

  it("accepts a JSON fenced response but still validates its structure", async () => {
    const agent = createModelBackedCreativeStrategyAgent({
      provider: providerReturning(```json\n${JSON.stringify(validStrategy)}\n```),
      model: "test-model",
    });

    const result = await agent.execute(envelope);
    expect(result.result.strategy).toEqual(validStrategy);
  });

  it("blocks malformed model output from becoming a strategy", async () => {
    const agent = createModelBackedCreativeStrategyAgent({
      provider: providerReturning("not valid JSON"),
      model: "test-model",
    });

    const result = await agent.execute(envelope);
    expect(result.status).toBe("needs_review");
    expect(result.result.strategy).toBeNull();
    expect(result.warnings).toContain("MODEL_STRATEGY_INVALID_JSON");
  });

  it("rejects incomplete strategy fields", async () => {
    const agent = createModelBackedCreativeStrategyAgent({
      provider: providerReturning(JSON.stringify({ primaryAngle: "Only one field" })),
      model: "test-model",
    });

    const result = await agent.execute(envelope);
    expect(result.result.strategy).toBeNull();
    expect(result.warnings).toContain("MODEL_STRATEGY_REQUIRED_FIELDS_MISSING");
  });

  it("converts provider failures into review-required results", async () => {
    const provider: ModelProvider = {
      providerId: "test",
      generate: vi.fn().mockRejectedValue(new Error("MODEL_RATE_LIMITED:anthropic")),
    };
    const agent = createModelBackedCreativeStrategyAgent({ provider, model: "test-model" });

    const result = await agent.execute(envelope);
    expect(result.status).toBe("needs_review");
    expect(result.result.strategy).toBeNull();
    expect(result.warnings).toContain("MODEL_RATE_LIMITED:anthropic");
  });

  it("requires an explicit model name", () => {
    expect(() => createModelBackedCreativeStrategyAgent({
      provider: providerReturning(JSON.stringify(validStrategy)),
      model: " ",
    })).toThrow("MODEL_NAME_REQUIRED");
  });
});
