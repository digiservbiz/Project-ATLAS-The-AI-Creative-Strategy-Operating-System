import { z } from "zod";

export const artifactLineageSchema = z.object({
  runId: z.string().min(1),
  organizationId: z.string().min(1),
  projectId: z.string().min(1),
  stage: z.string().min(1),
  artifactId: z.string().min(1),
  artifactType: z.string().min(1),
  parentArtifactId: z.string().min(1).nullable(),
  createdAt: z.string().datetime(),
  provenance: z.record(z.string(), z.unknown()).default({}),
});

export type ArtifactLineage = z.infer<typeof artifactLineageSchema>;

export function assertSameTenant(left: Pick<ArtifactLineage, "organizationId" | "projectId">, right: Pick<ArtifactLineage, "organizationId" | "projectId">): void {
  if (left.organizationId !== right.organizationId || left.projectId !== right.projectId) {
    throw new Error("TENANT_SCOPE_VIOLATION");
  }
}

export function assertParentArtifact(child: ArtifactLineage, parent: ArtifactLineage): void {
  assertSameTenant(child, parent);
  if (child.parentArtifactId !== parent.artifactId) {
    throw new Error("ARTIFACT_LINEAGE_BROKEN");
  }
}
