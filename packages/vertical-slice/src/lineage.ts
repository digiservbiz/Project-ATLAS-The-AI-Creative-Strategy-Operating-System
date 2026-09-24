import {
  assertParentArtifact,
  type ArtifactLineage,
} from "@atlas/contracts";

export interface StageArtifact extends ArtifactLineage {
  payload: Record<string, unknown>;
}

export function buildStageArtifactChain(input: {
  runId: string;
  organizationId: string;
  projectId: string;
  stages: string[];
}): StageArtifact[] {
  let parent: StageArtifact | undefined;
  return input.stages.map((stage, index) => {
    const artifact: StageArtifact = {
      runId: input.runId,
      organizationId: input.organizationId,
      projectId: input.projectId,
      stage,
      artifactId: `${input.runId}:${stage}`,
      artifactType: `${stage}-artifact`,
      parentArtifactId: parent?.artifactId ?? null,
      createdAt: "2026-01-15T00:00:00.000Z",
      provenance: { producer: "deterministic-vertical-slice", stageIndex: index },
      payload: {},
    };

    if (parent) assertParentArtifact(artifact, parent);
    parent = artifact;
    return artifact;
  });
}
