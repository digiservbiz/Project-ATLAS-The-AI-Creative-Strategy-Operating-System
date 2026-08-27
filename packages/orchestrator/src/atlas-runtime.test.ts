import { describe, expect, it } from "vitest";
import { AtlasOrchestrator } from "./index";
import { AtlasRuntime, InMemoryRuntimeStore } from "./atlas-runtime";

describe("AtlasRuntime", () => {
  it("executes a campaign workflow through the runtime boundary", async () => {
    const calls: string[] = [];
    const orchestrator = new AtlasOrchestrator([
      { skillId: "research", async execute() { calls.push("research"); return { output: { ok: true } }; } },
      { skillId: "strategy", async execute() { calls.push("strategy"); return { output: { ok: true } }; } },
      { skillId: "publish", async execute() { calls.push("publish"); return { output: { ok: true } }; } },
    ]);
    const runtime = new AtlasRuntime(orchestrator, new InMemoryRuntimeStore());
    const result = await runtime.start({
      runId: "campaign-run-1",
      context: { organizationId: "org-1", objective: "launch", inputs: {}, memory: {} },
      steps: [
        { id: "research", skillId: "research" },
        { id: "strategy", skillId: "strategy", dependsOn: ["research"] },
        { id: "publish", skillId: "publish", dependsOn: ["strategy"] },
      ],
    });
    expect(calls).toEqual(["research", "strategy", "publish"]);
    expect(result.state).toBe("completed");
  });

  it("turns an approval pause into an explicit runtime state", async () => {
    const orchestrator = new AtlasOrchestrator([{ skillId: "approval", async execute() { return { output: {}, requiresApproval: true }; } }]);
    const runtime = new AtlasRuntime(orchestrator, new InMemoryRuntimeStore());
    const result = await runtime.start({
      runId: "campaign-run-2",
      context: { organizationId: "org-1", objective: "launch", inputs: {}, memory: {} },
      steps: [{ id: "approval", skillId: "approval" }, { id: "publish", skillId: "approval", dependsOn: ["approval"] }],
    });
    expect(result.state).toBe("awaiting_approval");
    expect(result.workflow?.steps.publish).toBe("pending");
  });
});
