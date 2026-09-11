import { describe, expect, it } from "vitest";
import type { IntelligenceSnapshot, PlatformPerformanceInput } from "@atlas/intelligence";
import type { AgentContext, AgentResult, AgentSkill, WorkflowRun } from "@atlas/orchestrator";
import { AtlasAutonomousLoop } from "./atlas-autonomous-loop";
import type { AtlasOperatingLoopInput, AtlasOperatingLoopResult } from "./atlas-operating-loop";

const snapshot = {
  business: { business: { id: "business-1" } },
  state: { businessId: "business-1" },
  nextBestActions: [{ id: "action-1", type: "launch_creative_test", action: "Launch a creative test", reason: "test", evidence: [], expectedImpact: 0.8, confidence: 0.9, risk: "low", requiredApproval: false, priority: 90 }],
} as unknown as IntelligenceSnapshot;

const baseInput: AtlasOperatingLoopInput = {
  runId: "autonomous-beast",
  productUrl: "https://example.com/product",
  organizationId: "org-1",
  projectId: "project-1",
  snapshot,
};

function resultFor(input: AtlasOperatingLoopInput, performance?: PlatformPerformanceInput): AtlasOperatingLoopResult {
  const workflow: WorkflowRun = { id: input.runId, status: "completed", steps: { execute: "completed" }, outputs: { execute: { summary: "executed", requiresApproval: false } } };
  return {
    analysis: { product: { url: input.productUrl, images: [], text: "" }, valuePropositions: [], likelyAudience: [], objections: [], creativeAngles: [] },
    briefs: [],
    strategy: { businessId: "business-1", objective: "test", positioning: "test", audience: [], objections: [], angles: [], creativeBriefs: [], intelligence: { nextBestActionId: "action-1", reason: "test", confidence: 0.9, requiresApproval: false } },
    workflow,
    decision: { workflow: "creative_experimentation", actionId: "action-1", reason: "test", confidence: 0.9, requiresApproval: false },
    performance: performance ? { performance: performance as never, creative: {} as never, learning: { status: "supported" } as never, snapshot: { ...snapshot, state: { ...snapshot.state, knownLearnings: ["performance learning"] } } as IntelligenceSnapshot } : undefined,
    nextSnapshot: performance ? { ...snapshot, state: { ...snapshot.state, knownLearnings: ["performance learning"] } } as IntelligenceSnapshot : snapshot,
    nextDecision: { workflow: "creative_experimentation", actionId: "action-2", reason: "next test", confidence: 0.95, requiresApproval: false },
  };
}

describe("AtlasAutonomousLoop", () => {
  it("executes, ingests performance, re-evaluates, and starts the next iteration", async () => {
    const seen: AtlasOperatingLoopInput[] = [];
    const performance: PlatformPerformanceInput = { creativeId: "creative-1", businessId: "business-1", platform: "meta", period: { start: "2026-09-01", end: "2026-09-07" }, impressions: 1000, clicks: 50, spend: 100, conversions: 10, revenue: 400 };
    const operatingLoop = { run: async (input: AtlasOperatingLoopInput) => { seen.push(input); return resultFor(input, input.performance); } } as unknown as import("./atlas-operating-loop").AtlasOperatingLoop;
    const loop = new AtlasAutonomousLoop(operatingLoop);

    const result = await loop.run(baseInput, { maxIterations: 2, nextPerformance: async () => performance });

    expect(result.iterations).toHaveLength(2);
    expect(result.stopReason).toBe("max_iterations");
    expect(seen[0]?.performance).toBeUndefined();
    expect(seen[1]?.performance).toEqual(performance);
    expect(result.finalSnapshot.state.knownLearnings).toContain("performance learning");
  });

  it("stops immediately at an approval gate", async () => {
    const operatingLoop = { run: async (input: AtlasOperatingLoopInput) => ({ ...resultFor(input), workflow: { ...resultFor(input).workflow, outputs: { execute: { summary: "approval", requiresApproval: true } } } }) } as unknown as import("./atlas-operating-loop").AtlasOperatingLoop;
    const loop = new AtlasAutonomousLoop(operatingLoop);

    const result = await loop.run(baseInput, { maxIterations: 3, nextPerformance: async () => undefined });

    expect(result.iterations).toHaveLength(1);
    expect(result.stopReason).toBe("awaiting_approval");
  });
});
