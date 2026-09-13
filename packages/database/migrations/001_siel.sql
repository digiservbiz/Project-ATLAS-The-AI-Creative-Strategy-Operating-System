CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS atlas_semantic_objects (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  object_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT,
  market TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS atlas_semantic_objects_tenant_idx
  ON atlas_semantic_objects (organization_id, project_id, object_type);

CREATE TABLE IF NOT EXISTS atlas_semantic_embeddings (
  object_id TEXT NOT NULL REFERENCES atlas_semantic_objects(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  version TEXT NOT NULL,
  dimensions INTEGER NOT NULL CHECK (dimensions > 0),
  embedding vector NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (object_id, provider, model, version)
);

CREATE INDEX IF NOT EXISTS atlas_semantic_embeddings_object_idx
  ON atlas_semantic_embeddings (object_id);
