import { describe, expect, it } from "vitest";
import type { ExecutionEnvelope } from "@atlas/contracts";
import type { AgentDefinition, AgentResult } from "@atlas/agent-runtime";
import { AgentRegistry, AgentRuntime } from "@atlas/agent-runtime";
import { InMemoryWorkflowRunStore, WorkflowEngine, type WorkflowStep } from "./index.js";

function envelope(runId: string, organizationId = "org-1", projectId = "project-1"): ExecutionEnvelope {
  return {
    execution: { runId, agentId: "test-agent", agentVersion: "1", attempt: 1, requestedAt: "2026-01-01T00:00:00.000Z" },
    context: { organizationId, projectId },
    task: { objective: "test", constraints: [], instructions: [] },
    inputs: {}, knowledge: [], memory: [], tools: [],
  };
}
function runtimeFor(handler: (input: ExecutionEnvelope) => Promise<AgentResult>): AgentRuntime {
  const registry = new AgentRegistry();
  const agent: AgentDefinition = { identity: { agentId: "test-agent", version: "1", domain: "test" }, riskLevel: "low", allowedTools: [], execute: handler };
  registry.register(agent);
  return new AgentRuntime(registry);
}
function step(stepId: string, input: ExecutionEnvelope): WorkflowStep { return { stepId, agentId: "test-agent", agentVersion: "1", input }; }

describe("WorkflowEngine durable state", () => {
  it("persists completed steps and final output", async () => {
    const store = new InMemoryWorkflowRunStore();
    const result = await new WorkflowEngine(runtimeFor(async () => ({ status: "completed", result: { ok: true }, warnings: [] })), store).run([step("one", envelope("run-1")), step("two", envelope("run-1"))]);
    expect(result.status).toBe("completed");
    expect(result.completedSteps).toEqual(["one", "two"]);
    const persisted = await store.get("run-1", { organizationId: "org-1", projectId: "project-1" });
    expect(persisted?.status).toBe("completed");
    expect(persisted?.completedSteps).toEqual(["one", "two"]);
  });
  it("persists a final agent runtime failure", async () => {
    const store = new InMemoryWorkflowRunStore();
    const result = await new WorkflowEngine(runtimeFor(async () => { throw new Error("PERMANENT_FAILURE"); }), store).run([step("one", envelope("run-2"))]);
    expect(result.status).toBe("failed");
    expect(result.outputs.one.warnings).toEqual(["PERMANENT_FAILURE"]);
    expect((await store.get("run-2", { organizationId: "org-1", projectId: "project-1" }))?.status).toBe("failed");
  });
  it("persists scope mismatch as failed before throwing", async () => {
    const store = new InMemoryWorkflowRunStore();
    const engine = new WorkflowEngine(runtimeFor(async () => ({ status: "completed", result: {}, warnings: [] })), store);
    await expect(engine.run([step("one", envelope("run-3")), step("bad", envelope("run-3", "org-2", "project-1"))])).rejects.toThrow("WORKFLOW_SCOPE_MISMATCH");
    expect((await store.get("run-3", { organizationId: "org-1", projectId: "project-1" }))?.status).toBe("failed");
  });
});
