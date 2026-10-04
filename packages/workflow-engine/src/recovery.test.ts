import { describe, expect, it } from "vitest";
import { InMemoryWorkflowRunStore, WorkflowEngine, type WorkflowStep } from "./index.js";
import { AgentRegistry, AgentRuntime } from "@atlas/agent-runtime";

function step(runId: string, id: string, fail = false): WorkflowStep {
  return { stepId: id, agentId: "a", agentVersion: "1", input: {
    execution: { runId, agentId: "a", agentVersion: "1", attempt: 1, requestedAt: "2026-01-01T00:00:00.000Z" },
    context: { organizationId: "o", projectId: "p" },
    task: { objective: id, constraints: [], instructions: [] },
    inputs: { fail }, knowledge: [], memory: [], tools: [],
  }};
}

describe("workflow recovery contract", () => {
  it("persists the completed prefix when a later step fails", async () => {
    const registry = new AgentRegistry();
    registry.register({
      identity: { agentId: "a", version: "1", domain: "test" },
      riskLevel: "low", allowedTools: [],
      execute: async (input) => input.inputs.fail
        ? { status: "failed", result: {}, warnings: ["planned failure"] }
        : { status: "completed", result: { ok: true }, warnings: [] },
    });
    const store = new InMemoryWorkflowRunStore();
    const result = await new WorkflowEngine(new AgentRuntime(registry), store).run([step("r", "one"), step("r", "two", true)]);
    expect(result.status).toBe("failed");
    expect(result.completedSteps).toEqual(["one"]);
    expect((await store.get("r", { organizationId: "o", projectId: "p" }))?.completedSteps).toEqual(["one"]);
  });
});
