import type { ArtifactLineage } from "@atlas/contracts";
import type { StageArtifact } from "./lineage.js";

export interface ArtifactHandoff<T = Record<string, unknown>> {
  source: ArtifactLineage;
  payload: T;
}

export function createHandoff<T extends Record<string, unknown>>(artifact: StageArtifact): ArtifactHandoff<T> {
  return { source: artifact, payload: artifact.payload as T };
}

export function requireParentHandoff<T extends Record<string, unknown>>(
  artifacts: readonly StageArtifact[],
  stage: string,
): ArtifactHandoff<T> {
  const current = artifacts.find((artifact) => artifact.stage === stage);
  if (!current) throw new Error("ARTIFACT_STAGE_NOT_FOUND");
  if (!current.parentArtifactId) throw new Error("ARTIFACT_PARENT_REQUIRED");
  const parent = artifacts.find((artifact) => artifact.artifactId === current.parentArtifactId);
  if (!parent) throw new Error("ARTIFACT_PARENT_NOT_FOUND");
  return createHandoff<T>(parent);
}
