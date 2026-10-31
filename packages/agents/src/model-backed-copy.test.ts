import { describe, expect, it } from "vitest";
import type { ExecutionEnvelope } from "@atlas/contracts";
import type { ModelProvider } from "@atlas/model-gateway";
import { createModelBackedCreativeCopyAgent } from "./model-backed-copy.js";

const envelope: ExecutionEnvelope = {
  execution: { runId: "run-copy-test", agentId: "copy-test", agentVersion: "1.0.0", attempt: 1, requestedAt: "2026-10-31T08:00:00.000Z" },
  context: { organizationId: "org-test", projectId: "project-test" },
  task: { objective: "Create evidence-conscious ad copy", constraints: ["Do not invent claims"], instructions: [] },
  inputs: { productBrief: { productName: "Kitchen helper", benefit: "simplifies preparation" }, strategy: { primaryAngle: "time saved" } },
  knowledge: [], memory: [], tools: [],
};

function providerReturning(text: string): ModelProvider {
  return { providerId: "test", async generate(request) {
    expect(request.model).toBe("test-model");
    expect(request.system).toContain("Never invent testimonials");
    return { text, provider: "test", model: "test-model" };
  } };
}

describe("model-backed creative copy agent", () => {
  it("validates five hooks and keeps them under review", async () => {
    const hooks = { hooks: Array.from({ length: 5 }, (_, index) => ({
      text: `Hook ${index + 1}`, angle: `Angle ${index + 1}`, rationale: "Connects to the supplied customer problem",
    })) };
    const agent = createModelBackedCreativeCopyAgent({ provider: providerReturning(JSON.stringify(hooks)), model: "test-model", mode: "hooks" });
    const result = await agent.execute(envelope);
    expect(result.status).toBe("needs_review");
    expect((result.result.copy as typeof hooks).hooks).toHaveLength(5);
    expect(result.result.reviewRequired).toBe(true);
  });

  it("validates a multi-scene script and keeps it under review", async () => {
    const script = {
      format: "vertical video",
      durationSeconds: 30,
      scenes: [
        { time: "0-3s", visual: "Show the task", voiceover: "Still taking too long?", onScreenText: "Save preparation time" },
        { time: "3-12s", visual: "Demonstrate the product", voiceover: "Show the simple process", onScreenText: "Simple demonstration" },
        { time: "12-25s", visual: "Show the outcome", voiceover: "Make the routine easier", onScreenText: "A simpler routine" },
      ],
      cta: "Explore the product",
    };
    const agent = createModelBackedCreativeCopyAgent({ provider: providerReturning(JSON.stringify(script)), model: "test-model", mode: "script" });
    const result = await agent.execute(envelope);
    expect(result.status).toBe("needs_review");
    expect((result.result.copy as typeof script).scenes).toHaveLength(3);
    expect(result.result.reviewRequired).toBe(true);
  });

  it("does not approve malformed hook output", async () => {
    const agent = createModelBackedCreativeCopyAgent({ provider: providerReturning('{"hooks":[]}'), model: "test-model", mode: "hooks" });
    const result = await agent.execute(envelope);
    expect(result.status).toBe("needs_review");
    expect(result.result.copy).toBeNull();
    expect(result.warnings).toContain("MODEL_COPY_HOOKS_REQUIRED");
  });
});
