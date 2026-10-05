import { describe, expect, it } from "vitest";
import { buildStageArtifactChain } from "./lineage.js";
import { createHandoff, requireParentHandoff } from "./handoff.js";

describe("artifact handoffs", () => {
  const artifacts = buildStageArtifactChain({
    runId: "r", organizationId: "o", projectId: "p",
    stages: ["product", "strategy", "execution"],
    payloadByStage: { product: { productId: "p1" }, strategy: { angle: "problem-solution" } },
  });

  it("passes the exact parent artifact payload", () => {
    const handoff = requireParentHandoff<{ productId: string }>(artifacts, "strategy");
    expect(handoff.source.artifactId).toBe("r:product");
    expect(handoff.payload).toEqual({ productId: "p1" });
  });

  it("rejects a stage without a parent", () => {
    expect(() => createHandoff(artifacts[0])).not.toThrow();
    expect(() => requireParentHandoff(artifacts, "product")).toThrow("ARTIFACT_PARENT_REQUIRED");
  });
});
