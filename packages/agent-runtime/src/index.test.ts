import { describe, expect, it } from "vitest";
import { AgentRegistry, AgentRuntime } from "./index.js";
import type { AgentDefinition } from "./index.js";

const definition = (tools: readonly string[] = []): AgentDefinition => ({
  identity: { agentId: "strategy", version: "1.0.0", domain: "creative-strategy" },
  riskLevel: "low",
  allowedTools: tools,
  execute: async (input) => ({ status: "completed", result: input.inputs, warnings: [] }),
});

describe("AgentRuntime core boundaries", () => {
  it("rejects duplicate agent registrations", () => {
    const registry = new AgentRegistry();
    registry.register(definition());
    expect(() => registry.register(definition())).toThrow("Agent already registered");
  });

  it("blocks every unauthorized requested tool", async () => {
    const registry = new AgentRegistry();
    registry.register(definition(["read"]));
    const result = await new AgentRuntime(registry).execute({
      execution: { runId: "run-1", agentId: "strategy", agentVersion: "1.0.0", attempt: 1, requestedAt: "2026-01-01T00:00:00.000Z" },
      context: { organizationId: "org-1", projectId: "project-1" },
      task: { objective: "test", constraints: [], instructions: [] },
      inputs: { value: 1 },
      knowledge: [],
      memory: [],
      tools: ["read", "publish"],
    });
    expect(result.status).toBe("blocked");
    expect(result.warnings[0]).toContain("Tool not permitted");
  });

  it("executes only the registered agent version", async () => {
    const registry = new AgentRegistry();
    registry.register(definition());
    await expect(new AgentRuntime(registry).execute({
      execution: { runId: "run-1", agentId: "strategy", agentVersion: "9.0.0", attempt: 1, requestedAt: "2026-01-01T00:00:00.000Z" },
      context: { organizationId: "org-1", projectId: "project-1" },
      task: { objective: "test", constraints: [], instructions: [] },
      inputs: {},
      knowledge: [],
      memory: [],
      tools: [],
    })).rejects.toThrow("Agent not registered");
  });
});
