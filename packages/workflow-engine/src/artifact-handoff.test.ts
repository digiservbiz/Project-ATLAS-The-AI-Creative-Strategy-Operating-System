import { describe, expect, it } from "vitest";
import type { ExecutionEnvelope } from "@atlas/contracts";
import type { AgentDefinition, AgentResult } from "@atlas/agent-runtime";
import { AgentRegistry, AgentRuntime } from "@atlas/agent-runtime";
import { InMemoryWorkflowRunStore, WorkflowEngine, type WorkflowStep } from "./index.js";

function envelope(runId: string): ExecutionEnvelope {
  return {
    execution: { runId, agentId: "test-agent", agentVersion: "1", attempt: 1, requestedAt: "2026-01-01T00:00:00.000Z" },
    context: { organizationId: "org-1", projectId: "project-1" },
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

describe("WorkflowEngine artifact handoff", () => {
  it("injects and validates the supplied artifact handoff before execution", async () => {
    let received: ExecutionEnvelope | undefined;
    const runtime = runtimeFor(async (input) => {
      received = input;
      return { status: "completed", result: { ok: true }, warnings: [] };
    });
    const step: WorkflowStep = {
      stepId: "strategy",
      agentId: "test-agent",
      agentVersion: "1",
      input: envelope("run-handoff"),
      requiresArtifactHandoff: true,
      artifactHandoff: {
        sourceArtifactId: "run-handoff:product",
        sourceStage: "product",
        sourceArtifactType: "product-artifact",
        payload: { productId: "p1", customerProblem: "slow checkout" },
      },
    };

    const result = await new WorkflowEngine(runtime, new InMemoryWorkflowRunStore()).run([step]);
    expect(result.status).toBe("completed");
    expect(received?.inputs.artifactHandoff).toEqual(step.artifactHandoff);
  });

  it("blocks a required handoff when it is missing", async () => {
    const runtime = runtimeFor(async () => ({ status: "completed", result: {}, warnings: [] }));
    const step: WorkflowStep = { stepId: "strategy", agentId: "test-agent", agentVersion: "1", input: envelope("run-missing"), requiresArtifactHandoff: true };
    const result = await new WorkflowEngine(runtime, new InMemoryWorkflowRunStore()).run([step]);
    expect(result.status).toBe("blocked");
    expect(result.outputs.strategy.warnings).toEqual(["ARTIFACT_HANDOFF_REQUIRED"]);
  });

  it("rejects a self-referencing artifact handoff", async () => {
    const runtime = runtimeFor(async () => ({ status: "completed", result: {}, warnings: [] }));
    const step: WorkflowStep = {
      stepId: "strategy",
      agentId: "test-agent",
      agentVersion: "1",
      input: envelope("run-self"),
      artifactHandoff: { sourceArtifactId: "strategy", sourceStage: "strategy", sourceArtifactType: "strategy-artifact", payload: {} },
    };
    const result = await new WorkflowEngine(runtime, new InMemoryWorkflowRunStore()).run([step]);
    expect(result.status).toBe("blocked");
    expect(result.outputs.strategy.warnings).toEqual(["ARTIFACT_HANDOFF_SELF_REFERENCE"]);
  });
});
