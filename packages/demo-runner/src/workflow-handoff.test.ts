import { describe, expect, it } from "vitest";
import { deterministicScenarioInput, runDeterministicScenario } from "@atlas/vertical-slice";
import { buildDemoWorkflowSteps } from "./workflow.js";

describe("demo workflow artifact handoffs", () => {
  it("passes the previous stage artifact into every downstream step", () => {
    const result = runDeterministicScenario(deterministicScenarioInput);
    const steps = buildDemoWorkflowSteps(result);

    expect(steps).toHaveLength(result.stages.length);
    expect(steps[0]!.input.inputs.artifactHandoff).toBeUndefined();

    for (let index = 1; index < steps.length; index += 1) {
      const step = steps[index];
      const parent = result.artifacts[index - 1];
      if (!step || !parent) throw new Error("DEMO_HANDOFF_MISSING");
      const handoff = step.input.inputs.artifactHandoff as Record<string, unknown>;
      expect(handoff.sourceArtifactId).toBe(parent.artifactId);
      expect(handoff.sourceStage).toBe(parent.stage);
      expect(handoff.sourceArtifactType).toBe(parent.artifactType);
      expect(handoff.payload).toEqual(parent.payload);
      expect(step.input.context.organizationId).toBe(result.product.organizationId);
      expect(step.input.context.projectId).toBe(result.product.projectId);
    }
  });
});
