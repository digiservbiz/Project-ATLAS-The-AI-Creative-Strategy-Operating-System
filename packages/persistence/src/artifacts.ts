import {
  artifactLineageSchema,
  assertParentArtifact,
  assertSameTenant,
  type ArtifactLineage,
} from "@atlas/contracts";
import { Database } from "@atlas/database";

export interface PersistedArtifact extends ArtifactLineage {
  content: Record<string, unknown>;
}

export interface ArtifactRepository {
  save(artifact: PersistedArtifact): Promise<void>;
  getById(
    artifactId: string,
    scope: Pick<ArtifactLineage, "organizationId" | "projectId">,
  ): Promise<PersistedArtifact | null>;
  listRun(
    runId: string,
    scope: Pick<ArtifactLineage, "organizationId" | "projectId">,
  ): Promise<PersistedArtifact[]>;
}

function normalizeArtifact(artifact: PersistedArtifact): PersistedArtifact {
  artifactLineageSchema.parse(artifact);
  if (artifact.parentArtifactId === artifact.artifactId) {
    throw new Error("ARTIFACT_SELF_PARENT");
  }
  return artifact;
}

export class InMemoryArtifactRepository implements ArtifactRepository {
  private readonly data = new Map<string, PersistedArtifact>();

  async save(input: PersistedArtifact): Promise<void> {
    const artifact = normalizeArtifact(input);
    const existing = this.data.get(artifact.artifactId);

    if (existing) {
      assertSameTenant(existing, artifact);
      if (existing.runId !== artifact.runId || existing.stage !== artifact.stage) {
        throw new Error("ARTIFACT_ID_REUSE_CONFLICT");
      }
    }

    if (artifact.parentArtifactId) {
      const parent = this.data.get(artifact.parentArtifactId);
      if (!parent) throw new Error("PARENT_ARTIFACT_NOT_FOUND");
      assertParentArtifact(artifact, parent);
    }

    this.data.set(artifact.artifactId, artifact);
  }

  async getById(
    artifactId: string,
    scope: Pick<ArtifactLineage, "organizationId" | "projectId">,
  ): Promise<PersistedArtifact | null> {
    const artifact = this.data.get(artifactId);
    if (!artifact) return null;
    assertSameTenant(artifact, scope);
    return artifact;
  }

  async listRun(
    runId: string,
    scope: Pick<ArtifactLineage, "organizationId" | "projectId">,
  ): Promise<PersistedArtifact[]> {
    return [...this.data.values()]
      .filter((artifact) => artifact.runId === runId)
      .filter((artifact) => {
        assertSameTenant(artifact, scope);
        return true;
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}

export class PgArtifactRepository implements ArtifactRepository {
  constructor(private readonly db: Database) {}

  async save(input: PersistedArtifact): Promise<void> {
    const artifact = normalizeArtifact(input);

    if (artifact.parentArtifactId) {
      const parentRows = await this.db.query<{
        artifact_id: string;
        organization_id: string;
        project_id: string;
        run_id: string;
      }>(
        `SELECT artifact_id, organization_id, project_id, run_id
         FROM atlas_artifacts
         WHERE artifact_id = $1`,
        [artifact.parentArtifactId],
      );
      const parent = parentRows[0];
      if (!parent) throw new Error("PARENT_ARTIFACT_NOT_FOUND");
      if (
        parent.organization_id !== artifact.organizationId ||
        parent.project_id !== artifact.projectId ||
        parent.run_id !== artifact.runId
      ) {
        throw new Error("TENANT_OR_RUN_SCOPE_VIOLATION");
      }
    }

    await this.db.query(
      `INSERT INTO atlas_artifacts
        (artifact_id, run_id, organization_id, project_id, stage, artifact_type,
         parent_artifact_id, content, provenance, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::timestamptz)
       ON CONFLICT (artifact_id) DO UPDATE SET
         content=EXCLUDED.content,
         provenance=EXCLUDED.provenance`,
      [
        artifact.artifactId,
        artifact.runId,
        artifact.organizationId,
        artifact.projectId,
        artifact.stage,
        artifact.artifactType,
        artifact.parentArtifactId,
        JSON.stringify(artifact.content),
        JSON.stringify(artifact.provenance ?? {}),
        artifact.createdAt,
      ],
    );
  }

  async getById(
    artifactId: string,
    scope: Pick<ArtifactLineage, "organizationId" | "projectId">,
  ): Promise<PersistedArtifact | null> {
    const rows = await this.db.query<any>(
      `SELECT artifact_id, run_id, organization_id, project_id, stage, artifact_type,
              parent_artifact_id, content, provenance, created_at
       FROM atlas_artifacts
       WHERE artifact_id=$1 AND organization_id=$2 AND project_id=$3`,
      [artifactId, scope.organizationId, scope.projectId],
    );
    const row = rows[0];
    if (!row) return null;
    return this.mapRow(row);
  }

  async listRun(
    runId: string,
    scope: Pick<ArtifactLineage, "organizationId" | "projectId">,
  ): Promise<PersistedArtifact[]> {
    const rows = await this.db.query<any>(
      `SELECT artifact_id, run_id, organization_id, project_id, stage, artifact_type,
              parent_artifact_id, content, provenance, created_at
       FROM atlas_artifacts
       WHERE run_id=$1 AND organization_id=$2 AND project_id=$3
       ORDER BY created_at ASC, artifact_id ASC`,
      [runId, scope.organizationId, scope.projectId],
    );
    return rows.map((row) => this.mapRow(row));
  }

  private mapRow(row: any): PersistedArtifact {
    return {
      artifactId: row.artifact_id,
      runId: row.run_id,
      organizationId: row.organization_id,
      projectId: row.project_id,
      stage: row.stage,
      artifactType: row.artifact_type,
      parentArtifactId: row.parent_artifact_id ?? null,
      content: row.content ?? {},
      provenance: row.provenance ?? {},
      createdAt: row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    };
  }
}
