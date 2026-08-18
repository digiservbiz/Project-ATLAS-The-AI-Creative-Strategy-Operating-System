CREATE TABLE IF NOT EXISTS semantic_objects (
  id text PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  object_type text NOT NULL,
  source_id text NOT NULL,
  content text NOT NULL,
  language text,
  market text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_semantic_objects_org_project
  ON semantic_objects(organization_id, project_id);

CREATE INDEX IF NOT EXISTS idx_semantic_objects_type
  ON semantic_objects(organization_id, project_id, object_type);

CREATE TABLE IF NOT EXISTS semantic_embeddings (
  object_id text NOT NULL REFERENCES semantic_objects(id) ON DELETE CASCADE,
  provider text NOT NULL,
  model text NOT NULL,
  version text NOT NULL,
  dimensions integer NOT NULL CHECK (dimensions > 0),
  embedding vector(1536) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (object_id, provider, model, version)
);

CREATE INDEX IF NOT EXISTS idx_semantic_embeddings_hnsw
  ON semantic_embeddings USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_semantic_embeddings_model
  ON semantic_embeddings(model, version);
