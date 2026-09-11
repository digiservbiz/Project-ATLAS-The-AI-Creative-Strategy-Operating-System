# Project ATLAS — Project State

**Updated:** 2026-09-12
**Active branch:** `dev`
**Project:** AI Creative Strategy Operating System

## Current status

ATLAS is in **integration and production-hardening**. The intelligence layer is implemented as bounded services, durable PostgreSQL persistence is wired, persisted Strategic State/Learning records can be projected into SIEL/pgvector, production workflow execution can consume an intelligence-selected next action, and a local API composition shell is now available for smoke testing.

## Implemented intelligence layer

- Business Intelligence Model
- Strategic State / ATLAS Brain
- Evidence → Hypothesis → Decision pipeline
- Audience Intelligence
- Creative DNA
- Creative Hypothesis Engine
- Creative Experimentation model
- Experiment Outcome → Learning Record
- Learning → Strategic State integration
- Outcome-weighted semantic retrieval
- Angle Gap Detection
- Creative Fatigue Detection
- Hook → Promise → Creative → Offer → Landing Page → Checkout continuity diagnostics
- Offer Intelligence
- Funnel Intelligence
- Next Best Action Engine
- Continuous Competitive Change Detection
- Market Opportunity Detection
- Unified Intelligence Hub
- Intelligence Hub → Orchestrator workflow-selection adapter
- Persistent Intelligence Service
- In-memory persistence repository
- PostgreSQL intelligence persistence repository
- SIEL/pgvector intelligence projection for persisted Strategic State and Learning
- Intelligence-aware production orchestrator bridge
- Production runtime factory integration for intelligence-driven workflow selection
- Bounded autonomous operating loop with performance feedback and approval stops

## Persistence + semantic architecture

`PersistentIntelligenceService → IntelligenceRepository → PostgresIntelligenceRepository → @atlas/database → PostgreSQL`

`PersistentIntelligenceService → semantic-intelligence-projector → SemanticIntelligenceService → PgVectorSemanticRepository → semantic_objects + semantic_embeddings`

The existing persistence and semantic migrations are reused. No duplicate intelligence or vector tables were introduced. Intelligence records remain scoped by business, organization and project. Evidence IDs, versions, timestamps and JSON payloads are retained. Semantic projections preserve business/entity/version metadata and evidence provenance.

## Runtime integration

`IntelligenceSnapshot → selectNextWorkflow → IntelligenceAwareOrchestrator → mapped AgentSkill → AtlasOrchestrator → ProductionAtlasRuntime → durable queue/worker`

The bridge is opt-in through the production runtime factory. Existing workflows remain unchanged when intelligence mode is disabled or no intelligence snapshot is present. Scope validation prevents a snapshot whose business model and strategic state disagree from reaching execution.

## Local application entry point

`apps/api` provides a minimal dependency-light composition shell for local smoke testing:

- `GET /health` verifies the application process.
- `POST /v1/intelligence/actions` exercises the real Next Best Action engine without external credentials.
- `pnpm dev` starts the API on port 3000 by default.

This is intentionally a local/test boundary. Production authentication, database wiring, provider credentials, queues and account-specific adapters remain deployment concerns.

## Integration loop

`Business Intelligence → Strategic State → Evidence → Hypothesis → Experiment → Outcome → Learning → SIEL → Intelligence Hub → Next Best Action → Orchestrator → bounded workflow → Performance → Learning`

## Production-hardening checklist

1. Persist all intelligence entity types through the same repository boundary.
2. Connect canonical performance metrics to Creative DNA and learning records.
3. Expand end-to-end tests across research → strategy → execution → performance → learning.
4. Complete platform-specific strategy adapters.
5. Complete agency/multi-client tenant isolation and authorization checks across intelligence state and memory.
6. Validate PostgreSQL migrations, secrets, OAuth/provider scopes, scheduling, observability and deployment with real target-environment credentials.
7. Replace the local API shell's in-memory/request composition with production dependency-injection wiring for authenticated business-model/snapshot loading, scoped repositories, workflow skill maps and durable workers.

## Architectural rule

ATLAS remains `Intelligence + Memory + Orchestration + Specialized Agents + Tools`. Agents perform bounded tasks. Intelligence systems provide context and learning. The Orchestrator coordinates execution. Campaign actions that materially change spend or account state require explicit authorization/approval policies. Cross-business or cross-client intelligence must never be mixed.

## Important note

Code-level completion is not the same as production deployment. Real credentials, external services, database instances, provider scopes, monitoring and authorized end-to-end validation still have to be configured in the target environment.
