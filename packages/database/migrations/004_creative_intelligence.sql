CREATE TABLE IF NOT EXISTS creative_artifacts (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL,
  advertiser_name TEXT,
  market TEXT,
  platform TEXT,
  title TEXT,
  primary_text TEXT,
  headline TEXT,
  description TEXT,
  call_to_action TEXT,
  landing_page_url TEXT,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  language TEXT,
  first_seen_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, source, source_id)
);

CREATE INDEX IF NOT EXISTS creative_artifacts_org_idx
  ON creative_artifacts (organization_id);

CREATE INDEX IF NOT EXISTS creative_artifacts_source_idx
  ON creative_artifacts (source, source_id);

CREATE INDEX IF NOT EXISTS creative_artifacts_platform_idx
  ON creative_artifacts (platform);
