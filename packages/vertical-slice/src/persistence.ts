import type { ArtifactLineage } from "@atlas/contracts";
import { assertSameTenant, artifactLineageSchema } from "@atlas/contracts";
import type { VerticalSliceResult } from "@atlas/vertical-slice";
import type { ArtifactRepository, PersistedArtifact } from "@atlas/persistence";

export interface VerticalSliceArtifactMapper {
  toArtifacts(result: VerticalSliceResult): PersistedArtifact[];
}

export function createVerticalSliceArtifactMapper(): VerticalSliceArtifactMapper {
  return {
    toArtifacts(result) {
      return result.artifacts.map((artifact) => ({
        ...artifact,
        content: {
          stage: artifact.stage,
          artifactType: artifact.artifactType,
          payload: artifact.payload,
        },
      }));
    },
  };
}

export async function persistVerticalSliceResult(
  result: VerticalSliceResult,
  repository: ArtifactRepository,
): Promise<PersistedArtifact[]> {
  const artifacts = createVerticalSliceArtifactMapper().toArtifacts(result);
  for (const artifact of artifacts) {
    artifactLineageSchema.parse(artifact);
    await repository.save(artifact);
  }
  return artifacts;
}

export function validateArtifactChain(artifacts: readonly ArtifactLineage[]): void {
  const byId = new Map(artifacts.map((artifact) => [artifact.artifactId, artifact]));
  for (const artifact of artifacts) {
    if (!artifact.parentArtifactId) continue;
    const parent = byId.get(artifact.parentArtifactId);
    if (!parent) throw new Error("ARTIFACT_PARENT_NOT_FOUND");
    assertSameTenant(artifact, parent);
    if (artifact.runId !== parent.runId) throw new Error("ARTIFACT_RUN_SCOPE_VIOLATION");
  }
}
