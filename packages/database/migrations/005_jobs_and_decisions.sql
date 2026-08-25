CREATE TABLE IF NOT EXISTS atlas_jobs (
  id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('queued','running','completed','failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  run_at TIMESTAMPTZ NOT NULL,
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS atlas_jobs_claim_idx ON atlas_jobs(status, run_at);

CREATE TABLE IF NOT EXISTS atlas_strategy_decisions (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  campaign_id TEXT,
  category TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('scale','test','deprioritize')),
  rationale TEXT NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS atlas_strategy_decisions_campaign_idx ON atlas_strategy_decisions(campaign_id, created_at DESC);

CREATE TABLE IF NOT EXISTS atlas_idempotency_keys (
  key TEXT PRIMARY KEY,
  operation TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
