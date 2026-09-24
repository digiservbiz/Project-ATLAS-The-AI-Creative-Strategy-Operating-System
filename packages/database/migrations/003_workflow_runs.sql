CREATE TABLE IF NOT EXISTS atlas_workflow_runs (
  run_id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued','running','completed','needs_review','blocked','failed','cancelled')),
  completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS atlas_workflow_runs_tenant_idx
  ON atlas_workflow_runs (organization_id, project_id);

CREATE INDEX IF NOT EXISTS atlas_workflow_runs_tenant_status_idx
  ON atlas_workflow_runs (organization_id, project_id, status);
