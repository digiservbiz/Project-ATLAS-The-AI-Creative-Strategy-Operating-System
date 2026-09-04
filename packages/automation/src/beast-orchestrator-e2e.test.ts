import { describe, expect, it } from "vitest";
import type { AgentContext, AgentResult, AgentSkill, WorkflowStep } from "@atlas/orchestrator";
import { IntelligenceAwareOrchestrator } from "./intelligence-aware-orchestrator";
import type { IntelligenceSnapshot } from "@atlas/intelligence";

const BUSINESS_ID = "beast-business";

function snapshot(requiredApproval = false): IntelligenceSnapshot {
  return {
    business: { business: { id: BUSINESS_ID } },
    state: { businessId: BUSINESS_ID },
    nextBestActions: [
      {
        id: "nba-beast",
        type: "test_angle",
        reason: "Test a new creative angle",
        evidence: [],
        expectedImpact: 0.8,
        confidence: 0.92,
        risk: "low",
        requiredApproval,
        priority: 100,
      },
    ],
  } as unknown as IntelligenceSnapshot;
}

class RecordingSkill implements AgentSkill {
  readonly calls: AgentContext[] = [];

  constructor(readonly skillId: string, private readonly approval = false) {}

  async execute(context: AgentContext): Promise<AgentResult> {
    this.calls.push(context);
    return {
      output: { executed: this.skillId },
      requiresApproval: this.approval,
    };
  }
}

describe("ATLAS Beast Orchestrator E2E", () => {
  const context = (intelligenceSnapshot: IntelligenceSnapshot): AgentContext => ({
    organizationId: "beast-org",
    projectId: "beast-project",
    objective: "Improve creative performance",
    inputs: { productUrl: "https://example.com/product" },
    memory: { intelligenceSnapshot },
  });

  it("routes the next-best-action into the selected workflow skill", async () => {
    const creativeTest = new RecordingSkill("skill:creative-test");
    const fallback = new RecordingSkill("skill:fallback");
    const orchestrator = new IntelligenceAwareOrchestrator(
      [creativeTest, fallback],
      { creative_test: creativeTest.skillId },
    );

    const steps: WorkflowStep[] = [
      { id: "step-1", skillId: fallback.skillId },
    ];

    const run = await orchestrator.run("beast-run-001", context(snapshot()), steps);

    expect(run.status).toBe("completed");
    expect(run.steps["step-1"]).toBe("completed");
    expect(run.outputs["step-1"].output.executed).toBe(creativeTest.skillId);
    expect(creativeTest.calls).toHaveLength(1);
    expect(creativeTest.calls[0].memory.intelligenceDecision).toMatchObject({
      workflow: "creative_test",
      actionId: "nba-beast",
      requiresApproval: false,
    });
    expect(fallback.calls).toHaveLength(0);
  });

  it("preserves the approval gate selected by intelligence", async () => {
    const creativeTest = new RecordingSkill("skill:creative-test", true);
    const orchestrator = new IntelligenceAwareOrchestrator(
      [creativeTest],
      { creative_test: creativeTest.skillId },
    );

    const steps: WorkflowStep[] = [
      { id: "step-1", skillId: creativeTest.skillId },
      { id: "step-2", skillId: creativeTest.skillId, dependsOn: ["step-1"] },
    ];

    const run = await orchestrator.run("beast-run-approval", context(snapshot(true)), steps);

    expect(run.status).toBe("skipped");
    expect(run.steps["step-1"]).toBe("completed");
    expect(run.steps["step-2"]).toBe("pending");
    expect(creativeTest.calls).toHaveLength(1);
    expect(creativeTest.calls[0].memory.intelligenceDecision).toMatchObject({
      workflow: "creative_test",
      requiresApproval: true,
    });
  });

  it("rejects intelligence from another business before executing a skill", async () => {
    const creativeTest = new RecordingSkill("skill:creative-test");
    const orchestrator = new IntelligenceAwareOrchestrator(
      [creativeTest],
      { creative_test: creativeTest.skillId },
    );

    const foreign = snapshot();
    foreign.state.businessId = "foreign-business";

    await expect(
      orchestrator.run("beast-run-scope", context(foreign), [
        { id: "step-1", skillId: creativeTest.skillId },
      ]),
    ).rejects.toThrow("Intelligence snapshot business/state scope mismatch");

    expect(creativeTest.calls).toHaveLength(0);
  });
});
