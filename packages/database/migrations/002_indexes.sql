CREATE INDEX IF NOT EXISTS idx_brands_org ON brands(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_org ON workflow_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_org ON agent_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_org ON artifacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_memories_org ON memories(organization_id);
