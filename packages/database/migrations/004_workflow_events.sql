CREATE TABLE IF NOT EXISTS atlas_workflow_events (
  event_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  step_id TEXT NULL,
  event_type TEXT NOT NULL,
  attempt INTEGER NULL CHECK (attempt IS NULL OR attempt > 0),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT atlas_workflow_events_run_fk
    FOREIGN KEY (run_id) REFERENCES atlas_workflow_runs(run_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS atlas_workflow_events_tenant_run_idx
  ON atlas_workflow_events (organization_id, project_id, run_id, created_at);

CREATE INDEX IF NOT EXISTS atlas_workflow_events_step_idx
  ON atlas_workflow_events (run_id, step_id, created_at);
