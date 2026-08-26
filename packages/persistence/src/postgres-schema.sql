CREATE TABLE IF NOT EXISTS campaigns (id TEXT PRIMARY KEY, brand_id TEXT NOT NULL, product_id TEXT NOT NULL, objective TEXT NOT NULL, stage TEXT NOT NULL, status TEXT NOT NULL, version INTEGER NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS metrics (id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL REFERENCES campaigns(id), creative_id TEXT, source TEXT NOT NULL, collected_at TIMESTAMPTZ NOT NULL, metrics JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS learning_memories (id TEXT PRIMARY KEY, campaign_id TEXT, category TEXT NOT NULL, statement TEXT NOT NULL, confidence DOUBLE PRECISION NOT NULL, source_ids JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS strategy_decisions (id TEXT PRIMARY KEY, campaign_id TEXT, objective TEXT NOT NULL, recommendations JSONB NOT NULL, evidence_memory_ids JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL);
CREATE INDEX IF NOT EXISTS idx_metrics_campaign ON metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_memories_campaign ON learning_memories(campaign_id);
CREATE INDEX IF NOT EXISTS idx_decisions_campaign ON strategy_decisions(campaign_id);
