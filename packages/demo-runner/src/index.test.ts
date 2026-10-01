import { describe, expect, it } from "vitest";
import { runDemo } from "./index.js";

describe("ATLAS demo runner", () => {
  it("runs the full deterministic loop and persists artifacts", async () => {
    const run = await runDemo();

    expect(run.summary.status).toBe("needs_review");
    expect(run.summary.stages).toHaveLength(8);
    expect(run.summary.artifactCount).toBe(8);
    expect(run.summary.persistedArtifactCount).toBe(8);

    const artifacts = await run.artifactRepository.listRun(run.summary.runId, {
      organizationId: "org:atlas-demo",
      projectId: "project:atlas-demo",
    });

    expect(artifacts).toHaveLength(8);
    expect(artifacts[0].stage).toBe("product");
    expect(artifacts.at(-1)?.stage).toBe("next-action");
    expect(artifacts.slice(1).every((artifact, index) =>
      artifact.parentArtifactId === artifacts[index].artifactId,
    )).toBe(true);
  });

  it("persists a failed scenario without losing the workflow record", async () => {
    const run = await runDemo(undefined, { budgetCents: 0 });

    expect(run.summary.status).toBe("failed");
    expect(run.summary.failures.some((failure) => failure.code === "INVALID_BUDGET")).toBe(true);

    const workflow = await run.workflowStore.get(run.summary.runId, {
      organizationId: "org:atlas-demo",
      projectId: "project:atlas-demo",
    });

    expect(workflow?.status).toBe("failed");
    expect(workflow?.completedSteps).toHaveLength(8);
  });

  it("keeps persisted artifacts tenant-scoped", async () => {
    const run = await runDemo();

    await expect(run.artifactRepository.getById("product:scenario:product-to-learning-001", {
      organizationId: "org:other",
      projectId: "project:other",
    })).rejects.toThrow("TENANT_SCOPE_VIOLATION");
  });
});
