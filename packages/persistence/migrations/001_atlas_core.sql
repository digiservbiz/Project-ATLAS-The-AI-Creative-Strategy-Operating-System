CREATE TABLE IF NOT EXISTS atlas_campaigns (
  id TEXT NOT NULL,
  version INTEGER NOT NULL,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (id, version)
);

CREATE INDEX IF NOT EXISTS idx_atlas_campaigns_id_updated ON atlas_campaigns (id, updated_at DESC);

CREATE TABLE IF NOT EXISTS atlas_metrics (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_atlas_metrics_campaign_time ON atlas_metrics (campaign_id, collected_at DESC);

CREATE TABLE IF NOT EXISTS atlas_learning (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_atlas_learning_campaign_time ON atlas_learning (campaign_id, created_at DESC);
