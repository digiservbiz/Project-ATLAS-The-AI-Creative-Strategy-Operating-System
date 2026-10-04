import { describe, expect, it } from "vitest";
import { AgentRegistry, AgentRuntime } from "@atlas/agent-runtime";
import { InMemoryWorkflowRunStore, WorkflowEngine, type WorkflowStep } from "./index.js";
import type { ExecutionEnvelope } from "@atlas/contracts";

function env(runId: string): ExecutionEnvelope {
  return {
    execution: { runId, agentId: "a", agentVersion: "1", attempt: 1, requestedAt: "2026-01-01T00:00:00.000Z" },
    context: { organizationId: "o", projectId: "p" },
    task: { objective: "test", constraints: [], instructions: [] },
    inputs: {}, knowledge: [], memory: [], tools: [],
  };
}

describe("workflow idempotency", () => {
  it("rejects a duplicate run before executing agents", async () => {
    const store = new InMemoryWorkflowRunStore();
    const registry = new AgentRegistry();
    let calls = 0;
    registry.register({
      identity: { agentId: "a", version: "1", domain: "test" },
      riskLevel: "low",
      allowedTools: [],
      execute: async () => { calls++; return { status: "completed", result: {}, warnings: [] }; },
    });
    const engine = new WorkflowEngine(new AgentRuntime(registry), store);
    const steps: WorkflowStep[] = [{ stepId: "one", agentId: "a", agentVersion: "1", input: env("same-run") }];

    await engine.run(steps);
    await expect(engine.run(steps)).rejects.toThrow("WORKFLOW_RUN_ALREADY_EXISTS");
    expect(calls).toBe(1);
  });
});
