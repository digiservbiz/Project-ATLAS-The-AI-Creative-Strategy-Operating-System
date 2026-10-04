import { describe, expect, it } from "vitest";
import { InMemoryWorkflowRunStore, WorkflowEngine, type WorkflowStep } from "./index.js";
import { AgentRegistry, AgentRuntime } from "@atlas/agent-runtime";

function makeStep(runId: string, id: string): WorkflowStep {
  return { stepId: id, agentId: "a", agentVersion: "1", input: {
    execution: { runId, agentId: "a", agentVersion: "1", attempt: 1, requestedAt: "2026-01-01T00:00:00.000Z" },
    context: { organizationId: "o", projectId: "p" },
    task: { objective: id, constraints: [], instructions: [] },
    inputs: {}, knowledge: [], memory: [], tools: [],
  }};
}

describe("WorkflowEngine retry integration", () => {
  it("retries transient runtime failures and records the final attempt", async () => {
    const registry = new AgentRegistry();
    const attempts: number[] = [];
    registry.register({
      identity: { agentId: "a", version: "1", domain: "test" },
      riskLevel: "low", allowedTools: [],
      execute: async (input) => {
        attempts.push(input.execution.attempt);
        if (attempts.length < 3) throw new Error("MODEL_TIMEOUT");
        return { status: "completed", result: { attempt: input.execution.attempt }, warnings: [] };
      },
    });
    const engine = new WorkflowEngine(new AgentRuntime(registry), new InMemoryWorkflowRunStore(), { sleep: async () => undefined });
    const result = await engine.run([makeStep("r", "one")]);
    expect(result.status).toBe("completed");
    expect(attempts).toEqual([1, 2, 3]);
    expect(result.outputs.one.result).toEqual({ attempt: 3 });
  });
});
