import { describe, expect, it } from "vitest";
import { AtlasOrchestrator } from "./index";

const context = {
  organizationId: "org-1",
  objective: "create a campaign",
  inputs: {},
  memory: {},
};

describe("AtlasOrchestrator", () => {
  it("executes dependent skills in order", async () => {
    const calls: string[] = [];
    const orchestrator = new AtlasOrchestrator([
      {
        skillId: "research",
        async execute() {
          calls.push("research");
          return { output: { research: true } };
        },
      },
      {
        skillId: "strategy",
        async execute(ctx) {
          calls.push("strategy");
          expect(ctx.memory.workflowOutputs).toBeDefined();
          return { output: { strategy: true } };
        },
      },
    ]);

    const run = await orchestrator.run("run-1", context, [
      { id: "research", skillId: "research" },
      { id: "strategy", skillId: "strategy", dependsOn: ["research"] },
    ]);

    expect(calls).toEqual(["research", "strategy"]);
    expect(run.status).toBe("completed");
  });

  it("pauses when a skill requests human approval", async () => {
    const orchestrator = new AtlasOrchestrator([{
      skillId: "approval",
      async execute() {
        return { output: {}, requiresApproval: true };
      },
    }]);

    const run = await orchestrator.run("run-2", context, [
      { id: "approval", skillId: "approval" },
      { id: "next", skillId: "approval", dependsOn: ["approval"] },
    ]);

    expect(run.steps.next).toBe("pending");
  });
});
