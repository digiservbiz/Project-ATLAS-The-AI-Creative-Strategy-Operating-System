import { describe, expect, it } from "vitest";
import { AgentRegistry, AgentRuntime } from "@atlas/agent-runtime";
import { InMemoryWorkflowRunStore, WorkflowEngine, type WorkflowStep } from "./index.js";
import { resumeWorkflow } from "./recovery.js";

const makeStep = (runId: string, id: string, fail = false): WorkflowStep => ({
  stepId: id, agentId: "agent", agentVersion: "1",
  input: {
    execution: { runId, agentId: "agent", agentVersion: "1", attempt: 1, requestedAt: "2026-01-01T00:00:00.000Z" },
    context: { organizationId: "org", projectId: "project" },
    task: { objective: id, constraints: [], instructions: [] },
    inputs: { fail }, knowledge: [], memory: [], tools: [],
  },
});

describe("workflow resume", () => {
  it("continues after the persisted completed prefix without replaying it", async () => {
    const calls: string[] = [];
    const registry = new AgentRegistry();
    registry.register({
      identity: { agentId: "agent", version: "1", domain: "test" },
      riskLevel: "low", allowedTools: [],
      execute: async (input) => {
        const id = String(input.task.objective);
        calls.push(id);
        if (input.inputs.fail) return { status: "failed", result: {}, warnings: ["planned failure"] };
        return { status: "completed", result: { id }, warnings: [] };
      },
    });
    const store = new InMemoryWorkflowRunStore();
    const engine = new WorkflowEngine(new AgentRuntime(registry), store);
    const steps = [makeStep("resume-1", "one"), makeStep("resume-1", "two", true), makeStep("resume-1", "three")];

    const first = await engine.run(steps);
    expect(first.status).toBe("failed");
    expect(first.completedSteps).toEqual(["one"]);

    const resumedSteps = [steps[0], makeStep("resume-1", "two"), steps[2]];
    const resumed = await resumeWorkflow(engine, store, resumedSteps);
    expect(resumed.status).toBe("completed");
    expect(resumed.completedSteps).toEqual(["one", "two", "three"]);
    expect(calls).toEqual(["one", "two", "two", "three"]);
  });

  it("rejects a checkpoint whose step prefix does not match", async () => {
    const store = new InMemoryWorkflowRunStore();
    const registry = new AgentRegistry();
    registry.register({ identity: { agentId: "agent", version: "1", domain: "test" }, riskLevel: "low", allowedTools: [], execute: async () => ({ status: "completed", result: {}, warnings: [] }) });
    const engine = new WorkflowEngine(new AgentRuntime(registry), store);
    await engine.run([makeStep("resume-2", "one"), makeStep("resume-2", "two", true)]);
    await expect(resumeWorkflow(engine, store, [makeStep("resume-2", "wrong"), makeStep("resume-2", "two")])).rejects.toThrow("WORKFLOW_CHECKPOINT_MISMATCH");
  });
});
