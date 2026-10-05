import { describe, expect, it } from "vitest";
import { AgentRegistry, AgentRuntime, type AgentDefinition } from "@atlas/agent-runtime";
import type { ExecutionEnvelope } from "@atlas/contracts";
import { InMemoryWorkflowEventStore } from "./events.js";
import { InMemoryWorkflowRunStore, WorkflowEngine, type WorkflowStep } from "./index.js";

function input(runId: string, organizationId = "org-1", projectId = "project-1"): ExecutionEnvelope {
  return {
    execution: {
      runId,
      agentId: "agent-1",
      agentVersion: "1.0.0",
      attempt: 1,
      requestedAt: "2026-01-15T00:00:00.000Z",
    },
    context: { organizationId, projectId },
    task: { objective: "test", constraints: [], instructions: [] },
    inputs: {},
    knowledge: [],
    memory: [],
    tools: [],
  };
}

function runtime(result: "completed" | "blocked" | "failed"): AgentRuntime {
  const registry = new AgentRegistry();
  const definition: AgentDefinition = {
    identity: { agentId: "agent-1", version: "1.0.0", domain: "test" },
    riskLevel: "low",
    allowedTools: [],
    execute: async () => ({ status: result, result: {}, warnings: result === "completed" ? [] : [result] }),
  };
  registry.register(definition);
  return new AgentRuntime(registry);
}

describe("workflow engine audit events", () => {
  it("emits run and step lifecycle events for a successful run", async () => {
    const events = new InMemoryWorkflowEventStore();
    const engine = new WorkflowEngine(runtime("completed"), new InMemoryWorkflowRunStore(), { eventStore: events });
    const step: WorkflowStep = { stepId: "step-1", agentId: "agent-1", agentVersion: "1.0.0", input: input("run-events-1") };

    const result = await engine.run([step]);
    const emitted = await events.list("run-events-1", { organizationId: "org-1", projectId: "project-1" });

    expect(result.status).toBe("completed");
    expect(emitted.map((item) => item.type)).toEqual([
      "run_created",
      "step_started",
      "step_succeeded",
      "run_completed",
    ]);
  });

  it("emits blocked and run_failed events when an agent blocks", async () => {
    const events = new InMemoryWorkflowEventStore();
    const engine = new WorkflowEngine(runtime("blocked"), new InMemoryWorkflowRunStore(), { eventStore: events });
    const step: WorkflowStep = { stepId: "step-1", agentId: "agent-1", agentVersion: "1.0.0", input: input("run-events-2") };

    const result = await engine.run([step]);
    const emitted = await events.list("run-events-2", { organizationId: "org-1", projectId: "project-1" });

    expect(result.status).toBe("blocked");
    expect(emitted.map((item) => item.type)).toEqual([
      "run_created",
      "step_started",
      "step_blocked",
      "run_failed",
    ]);
  });
});
