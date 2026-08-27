CREATE TABLE IF NOT EXISTS atlas_campaigns (id TEXT NOT NULL, version INTEGER NOT NULL, payload JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL, PRIMARY KEY (id, version));
CREATE TABLE IF NOT EXISTS atlas_metrics (id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL, payload JSONB NOT NULL, collected_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS atlas_learning (id TEXT PRIMARY KEY, campaign_id TEXT, payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS atlas_jobs (id TEXT PRIMARY KEY, type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'queued', payload JSONB NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, available_at TIMESTAMPTZ NOT NULL, locked_at TIMESTAMPTZ, locked_by TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_atlas_jobs_due ON atlas_jobs(status, available_at);
CREATE INDEX IF NOT EXISTS idx_atlas_metrics_campaign_time ON atlas_metrics(campaign_id, collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_atlas_learning_campaign_time ON atlas_learning(campaign_id, created_at DESC);
