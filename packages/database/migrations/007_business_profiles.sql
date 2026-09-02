CREATE TABLE IF NOT EXISTS business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id uuid NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  model text NOT NULL DEFAULT 'other',
  description text,
  markets jsonb NOT NULL DEFAULT '[]'::jsonb,
  channels jsonb NOT NULL DEFAULT '[]'::jsonb,
  audiences jsonb NOT NULL DEFAULT '[]'::jsonb,
  competitors jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_business_profiles_org_project
  ON business_profiles(organization_id, project_id);
