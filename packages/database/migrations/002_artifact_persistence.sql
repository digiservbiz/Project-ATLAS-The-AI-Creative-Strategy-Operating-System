CREATE TABLE IF NOT EXISTS atlas_artifacts (
  artifact_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  parent_artifact_id TEXT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT atlas_artifacts_parent_fk
    FOREIGN KEY (parent_artifact_id) REFERENCES atlas_artifacts(artifact_id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS atlas_artifacts_tenant_run_idx
  ON atlas_artifacts (organization_id, project_id, run_id);

CREATE INDEX IF NOT EXISTS atlas_artifacts_tenant_stage_idx
  ON atlas_artifacts (organization_id, project_id, stage);

CREATE INDEX IF NOT EXISTS atlas_artifacts_parent_idx
  ON atlas_artifacts (parent_artifact_id);
