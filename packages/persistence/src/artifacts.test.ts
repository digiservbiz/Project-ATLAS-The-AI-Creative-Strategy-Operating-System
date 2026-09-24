import { describe, expect, it } from "vitest";
import {
  InMemoryArtifactRepository,
  type PersistedArtifact,
} from "./artifacts.js";

const base = {
  runId: "run-1",
  organizationId: "org-1",
  projectId: "project-1",
};

function artifact(overrides: Partial<PersistedArtifact> = {}): PersistedArtifact {
  return {
    ...base,
    stage: "strategy",
    artifactId: "artifact-1",
    artifactType: "strategy-artifact",
    parentArtifactId: null,
    createdAt: "2026-01-15T00:00:00.000Z",
    provenance: { producer: "test" },
    content: { angle: "problem-solution" },
    ...overrides,
  };
}

describe("InMemoryArtifactRepository", () => {
  it("persists and retrieves artifacts within tenant scope", async () => {
    const repository = new InMemoryArtifactRepository();
    await repository.save(artifact());

    await expect(repository.getById("artifact-1", base)).resolves.toMatchObject({
      artifactId: "artifact-1",
      organizationId: "org-1",
      projectId: "project-1",
    });
  });

  it("rejects missing parents", async () => {
    const repository = new InMemoryArtifactRepository();

    await expect(repository.save(artifact({
      artifactId: "artifact-2",
      parentArtifactId: "missing",
    }))).rejects.toThrow("PARENT_ARTIFACT_NOT_FOUND");
  });

  it("rejects cross-tenant parents", async () => {
    const repository = new InMemoryArtifactRepository();
    await repository.save(artifact());

    await expect(repository.save(artifact({
      artifactId: "artifact-2",
      parentArtifactId: "artifact-1",
      organizationId: "org-2",
    }))).rejects.toThrow("TENANT_SCOPE_VIOLATION");
  });

  it("lists a run only inside the requested tenant", async () => {
    const repository = new InMemoryArtifactRepository();
    await repository.save(artifact());
    await repository.save(artifact({
      artifactId: "artifact-2",
      stage: "execution",
      artifactType: "execution-artifact",
      parentArtifactId: "artifact-1",
      createdAt: "2026-01-15T00:01:00.000Z",
    }));

    await expect(repository.listRun("run-1", base)).resolves.toHaveLength(2);
    await expect(repository.listRun("run-1", {
      organizationId: "org-other",
      projectId: "project-1",
    })).resolves.toThrow();
  });
});
