import { describe, expect, it } from "vitest";
import type { AgentContext, AgentSkill, WorkflowStep } from "@atlas/orchestrator";
import { IntelligenceAwareOrchestrator } from "./intelligence-aware-orchestrator";

const intelligenceSnapshot = {
  business: { business: { id: "business-1" } },
  state: { businessId: "business-1", confidence: 0.9 },
  nextBestActions: [{
    id: "nba-1", type: "test_angle", reason: "Angle gap detected", priority: 90,
    confidence: 0.88, requiredApproval: false,
  }],
} as any;

describe("IntelligenceAwareOrchestrator", () => {
  it("uses the intelligence-selected skill while preserving the workflow", async () => {
    let executed = "";
    const research: AgentSkill = { skillId: "research", async execute() { executed = "research"; return { output: {} }; } };
    const creative: AgentSkill = { skillId: "creative-test", async execute(context) {
      executed = "creative-test";
      expect(context.memory.intelligenceDecision).toMatchObject({ workflow: "creative_test", actionId: "nba-1" });
      return { output: { selectedBy: "intelligence" } };
    } };
    const orchestrator = new IntelligenceAwareOrchestrator([research, creative], { creative_test: "creative-test" });
    const context: AgentContext = {
      organizationId: "org-1", projectId: "project-1", objective: "improve creative",
      inputs: {}, memory: { intelligenceSnapshot },
    };
    const run = await orchestrator.run("run-1", context, [{ id: "first", skillId: "research" }]);
    expect(executed).toBe("creative-test");
    expect(run.steps.first).toBe("completed");
    expect(run.outputs.first.output.selectedBy).toBe("intelligence");
  });

  it("blocks execution when the intelligence decision requires approval", async () => {
    let executed = false;
    const risky: AgentSkill = {
      skillId: "risky-action",
      async execute() { executed = true; return { output: { shouldNotRun: true } }; },
    };
    const snapshot = {
      ...intelligenceSnapshot,
      nextBestActions: [{
        id: "nba-approval", type: "adjust_budget", reason: "Scale winning campaign",
        priority: 100, confidence: 0.97, requiredApproval: true,
      }],
    } as any;
    const orchestrator = new IntelligenceAwareOrchestrator([risky], { analysis: "risky-action" });
    const context: AgentContext = {
      organizationId: "org-1", projectId: "project-1", objective: "scale",
      inputs: {}, memory: { intelligenceSnapshot: snapshot },
    };

    const run = await orchestrator.run("run-approval", context, [{ id: "first", skillId: "risky-action" }]);

    expect(executed).toBe(false);
    expect(run.steps.first).toBe("skipped");
    expect(run.outputs.first.requiresApproval).toBe(true);
    expect(run.outputs.first.output).toMatchObject({
      approvalRequired: true,
      workflow: "analysis",
      actionId: "nba-approval",
    });
  });

  it("rejects a snapshot whose business and strategic state disagree", async () => {
    const skill: AgentSkill = { skillId: "research", async execute() { return { output: {} }; } };
    const orchestrator = new IntelligenceAwareOrchestrator([skill], { research: "research" });
    const context: AgentContext = {
      organizationId: "org-1", projectId: "project-1", objective: "test", inputs: {},
      memory: { intelligenceSnapshot: { ...intelligenceSnapshot, state: { businessId: "other-business" } } },
    };
    await expect(orchestrator.run("run-2", context, [{ id: "first", skillId: "research" }]))
      .rejects.toThrow("business/state scope mismatch");
  });
});
