CREATE TABLE IF NOT EXISTS atlas_intelligence_records (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('strategic_state','decision','hypothesis','experiment','learning','creative_dna','audience')),
  version INTEGER NOT NULL CHECK (version > 0),
  data JSONB NOT NULL,
  evidence_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS atlas_intelligence_scope_idx ON atlas_intelligence_records(organization_id, project_id, business_id, entity_type, updated_at DESC);
CREATE INDEX IF NOT EXISTS atlas_intelligence_business_idx ON atlas_intelligence_records(business_id, entity_type, updated_at DESC);

-- Semantic projection: intelligence records can be mirrored into the existing SIEL tables.
CREATE INDEX IF NOT EXISTS atlas_intelligence_data_gin_idx ON atlas_intelligence_records USING gin (data);
