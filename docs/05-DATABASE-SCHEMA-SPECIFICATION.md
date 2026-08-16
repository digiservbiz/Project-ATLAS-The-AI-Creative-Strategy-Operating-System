# ATLAS AI — Database Schema Specification

**Version:** 1.0.0  
**Status:** Foundation  
**Branch:** `dev`

## 1. Purpose

This document defines the logical relational data model for ATLAS. PostgreSQL is the initial system of record. The schema is designed to support multi-tenancy, projects, brands, campaigns, workflows, agent executions, artifacts, memory, knowledge, evaluations, approvals, and integrations.

The database must preserve execution history rather than treating AI output as disposable chat text.

## 2. Database Principles

- PostgreSQL is the source of truth for transactional application data.
- Every tenant-owned record must be isolated by organization.
- UUIDs are used for application identifiers.
- Timestamps are stored in UTC.
- Important AI outputs are immutable artifacts with version history.
- JSONB is used for flexible agent payloads, not as a replacement for relational modeling.
- Vector embeddings are stored with knowledge chunks and can use pgvector.
- Secrets are never stored in ordinary database fields.
- Soft deletion is preferred for user-facing business records where recovery is valuable.

## 3. Core Entity Hierarchy

```text
Organization
 ├── Users / Memberships
 ├── Projects
 │    ├── Brands
 │    ├── Campaigns
 │    │    ├── Creative Assets
 │    │    └── Experiments
 │    ├── Workflows / Workflow Runs
 │    ├── Knowledge Sources / Chunks
 │    └── Memories
 ├── Integrations
 └── Usage / Billing records
```

## 4. Organization

### `organizations`

Represents a tenant.

Key fields:

- `id` UUID PK
- `name`
- `slug` unique
- `status`
- `created_at`
- `updated_at`

## 5. Users and Memberships

### `users`

Represents an authenticated person.

Key fields:

- `id` UUID PK
- `external_auth_id` nullable/unique depending on auth provider
- `email`
- `name`
- `created_at`
- `updated_at`

### `organization_memberships`

Associates users with organizations.

Key fields:

- `id`
- `organization_id` FK
- `user_id` FK
- `role`
- `created_at`

Initial roles:

- `owner`
- `admin`
- `member`
- `viewer`

## 6. Projects

### `projects`

A project is the main workspace for a marketing initiative or brand engagement.

Fields:

- `id`
- `organization_id`
- `name`
- `slug`
- `description`
- `status`
- `created_by`
- `created_at`
- `updated_at`

Statuses:

- `active`
- `archived`
- `completed`

## 7. Brands

### `brands`

Stores brand-level strategic context.

Fields:

- `id`
- `organization_id`
- `project_id` nullable
- `name`
- `website_url`
- `industry`
- `market`
- `language`
- `tone_of_voice` JSONB
- `brand_rules` JSONB
- `audience_summary` JSONB
- `created_at`
- `updated_at`

Brand rules may include approved claims, prohibited claims, vocabulary, positioning, and style requirements.

## 8. Products

### `products`

Represents a product or service analyzed by ATLAS.

Fields:

- `id`
- `organization_id`
- `project_id`
- `brand_id`
- `name`
- `description`
- `url`
- `price` nullable
- `currency` nullable
- `features` JSONB
- `benefits` JSONB
- `known_objections` JSONB
- `created_at`
- `updated_at`

## 9. Campaigns

### `campaigns`

Represents a marketing campaign or creative testing initiative.

Fields:

- `id`
- `organization_id`
- `project_id`
- `brand_id`
- `product_id` nullable
- `name`
- `objective`
- `channel`
- `status`
- `brief` JSONB
- `created_at`
- `updated_at`

Initial campaign statuses:

- `draft`
- `researching`
- `strategy`
- `production`
- `review`
- `active`
- `paused`
- `completed`

## 10. Workflow Definitions

### `workflow_definitions`

Stores reusable workflow templates.

Fields:

- `id`
- `organization_id` nullable for system workflows
- `workflow_key`
- `version`
- `name`
- `description`
- `input_schema` JSONB
- `definition` JSONB
- `active`
- `created_at`

A system workflow can be available to multiple organizations while private workflows belong to one organization.

## 11. Workflow Runs

### `workflow_runs`

Represents an execution of a workflow.

Fields:

- `id`
- `workflow_definition_id`
- `organization_id`
- `project_id`
- `campaign_id` nullable
- `status`
- `current_step`
- `context` JSONB
- `started_at`
- `completed_at`
- `error_state` JSONB nullable
- `created_at`
- `updated_at`

## 12. Workflow Steps

### `workflow_step_runs`

Represents each individual step in a workflow execution.

Fields:

- `id`
- `workflow_run_id`
- `step_key`
- `agent_id`
- `agent_version`
- `status`
- `attempt_count`
- `input_artifact_id` nullable
- `output_artifact_id` nullable
- `started_at`
- `completed_at`
- `error` JSONB nullable

## 13. Agent Executions

### `agent_runs`

Stores each actual specialist execution.

Fields:

- `id`
- `organization_id`
- `workflow_run_id` nullable
- `agent_id`
- `agent_version`
- `status`
- `model_provider`
- `model_name`
- `input_artifact_id` nullable
- `output_artifact_id` nullable
- `token_usage` JSONB nullable
- `latency_ms` nullable
- `attempt`
- `error` JSONB nullable
- `created_at`
- `completed_at`

## 14. Artifacts

### `artifacts`

An artifact is a durable piece of generated or imported work.

Examples:

- Research report
- Customer profile
- Positioning strategy
- Creative angle list
- Hooks
- Scripts
- Creative brief
- QA report

Fields:

- `id`
- `organization_id`
- `project_id`
- `campaign_id` nullable
- `artifact_type`
- `version`
- `parent_artifact_id` nullable
- `title`
- `content` JSONB
- `text_content` nullable
- `created_by_type`
- `created_by_id` nullable
- `created_at`

Artifacts should be append-only. New revisions create new records.

## 15. Approvals

### `approvals`

Tracks human decisions.

Fields:

- `id`
- `organization_id`
- `workflow_run_id`
- `step_run_id` nullable
- `requested_by`
- `reviewed_by` nullable
- `status`
- `reason`
- `questions` JSONB
- `decision` JSONB nullable
- `requested_at`
- `reviewed_at`

Statuses:

- `pending`
- `approved`
- `rejected`
- `changes_requested`

## 16. Knowledge Sources

### `knowledge_sources`

Represents documents or external sources used by RAG.

Fields:

- `id`
- `organization_id` nullable
- `project_id` nullable
- `source_type`
- `title`
- `uri` nullable
- `mime_type` nullable
- `checksum` nullable
- `metadata` JSONB
- `ingestion_status`
- `created_at`
- `updated_at`

Source types may include:

- `file`
- `url`
- `notion`
- `manual`
- `integration`
- `system_knowledge`

## 17. Knowledge Chunks

### `knowledge_chunks`

Stores retrieval units derived from sources.

Fields:

- `id`
- `knowledge_source_id`
- `organization_id` nullable
- `project_id` nullable
- `chunk_index`
- `content`
- `metadata` JSONB
- `embedding`
- `created_at`

The embedding column uses pgvector in the initial implementation.

## 18. Memories

### `memories`

Stores project-specific durable knowledge derived from events, decisions, or results.

Fields:

- `id`
- `organization_id`
- `project_id`
- `campaign_id` nullable
- `memory_type`
- `content` JSONB
- `importance`
- `source_type`
- `source_id` nullable
- `confidence` nullable
- `created_at`
- `updated_at`
- `expires_at` nullable

Memory types:

- `decision`
- `preference`
- `fact`
- `learning`
- `experiment_result`
- `winning_pattern`
- `failure_pattern`

## 19. Creative Assets

### `creative_assets`

Stores metadata for uploaded or generated creative files.

Fields:

- `id`
- `organization_id`
- `project_id`
- `campaign_id` nullable
- `asset_type`
- `storage_uri`
- `mime_type`
- `metadata` JSONB
- `status`
- `created_at`

The actual binary asset should live in object storage, not PostgreSQL.

## 20. Experiments

### `experiments`

Represents structured creative or marketing tests.

Fields:

- `id`
- `organization_id`
- `campaign_id`
- `name`
- `hypothesis`
- `variable`
- `control_definition` JSONB
- `variant_definition` JSONB
- `status`
- `started_at`
- `ended_at`

## 21. Experiment Results

### `experiment_results`

Stores measured outcomes.

Fields:

- `id`
- `experiment_id`
- `variant`
- `metric_name`
- `metric_value`
- `sample_size` nullable
- `period_start`
- `period_end`
- `source`
- `metadata` JSONB
- `created_at`

## 22. Agent Evaluations

### `agent_evaluations`

Stores evaluation results for agent outputs.

Fields:

- `id`
- `agent_run_id`
- `evaluator_type`
- `evaluation_suite`
- `score` JSONB
- `passed`
- `feedback`
- `created_at`

## 23. Integrations

### `integrations`

Stores non-secret integration metadata.

Fields:

- `id`
- `organization_id`
- `provider`
- `status`
- `external_account_id` nullable
- `scopes` JSONB
- `metadata` JSONB
- `created_at`
- `updated_at`

OAuth tokens and secrets must be stored through an appropriate secret-management mechanism. They must not be exposed through this table.

## 24. Audit Events

### `audit_events`

Records security-sensitive or important user/system actions.

Fields:

- `id`
- `organization_id`
- `actor_type`
- `actor_id` nullable
- `event_type`
- `resource_type`
- `resource_id` nullable
- `metadata` JSONB
- `created_at`

## 25. Usage Records

### `usage_records`

Tracks model/tool usage for operational visibility and future billing.

Fields:

- `id`
- `organization_id`
- `project_id` nullable
- `agent_run_id` nullable
- `provider`
- `model`
- `input_tokens` nullable
- `output_tokens` nullable
- `estimated_cost` nullable
- `created_at`

## 26. Relationships

Important relationships:

```text
organization 1 ── * projects
organization 1 ── * memberships
project      1 ── * brands
project      1 ── * products
project      1 ── * campaigns
campaign     1 ── * workflow_runs
workflow_run 1 ── * workflow_step_runs
workflow_step_run 1 ── * agent_runs
agent_run    1 ── * artifacts
project      1 ── * memories
knowledge_source 1 ── * knowledge_chunks
campaign     1 ── * experiments
experiment   1 ── * experiment_results
```

## 27. Indexing Strategy

Initial indexes should prioritize:

- `organization_id`
- `project_id`
- `campaign_id`
- `workflow_run_id`
- `agent_id`
- `created_at`
- status fields where high-cardinality filtering is useful

Knowledge retrieval requires an appropriate vector index once the embedding dimension and retrieval strategy are finalized.

## 28. Tenant Isolation

Every query against tenant-owned data must be scoped to the authenticated organization.

The application layer must never accept an arbitrary organization ID from the client and trust it without authorization.

PostgreSQL Row Level Security may be introduced as defense-in-depth when the connection/session architecture supports it.

## 29. Retention

Not all data has the same retention requirement.

Recommended categories:

- Audit events: long retention.
- Workflow/agent history: long retention for debugging and learning.
- Temporary execution payloads: configurable retention.
- Knowledge sources: retained while active.
- User-deleted business records: soft deletion followed by policy-based purge.

Retention policies must be documented before production launch.

## 30. Migration Strategy

Database changes must be versioned migrations.

Never modify production schema manually without recording the equivalent migration.

Migration requirements:

- Forward migration.
- Rollback strategy where practical.
- Backward-compatible deployment sequencing for breaking changes.
- Seed data separated from schema migrations.

## 31. Initial MVP Tables

The first vertical slice only needs:

1. `organizations`
2. `users`
3. `organization_memberships`
4. `projects`
5. `brands`
6. `products`
7. `campaigns`
8. `workflow_definitions`
9. `workflow_runs`
10. `workflow_step_runs`
11. `agent_runs`
12. `artifacts`
13. `approvals`
14. `memories`

Knowledge, experiments, usage, and integration tables can be introduced immediately after the core workflow is proven.

## 32. Definition of Done

The database foundation is ready when:

- Entity relationships are implemented as migrations.
- Foreign keys and indexes exist.
- Tenant boundaries are enforced.
- Workflow and agent execution history is durable.
- Artifacts are versionable.
- Approval states are persisted.
- A local development database can be created from zero using documented commands.
- Automated schema validation/tests pass.

---

**Next:** Memory System Specification.
