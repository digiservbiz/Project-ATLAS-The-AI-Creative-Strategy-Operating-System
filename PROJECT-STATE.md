# Project ATLAS — Project State

**Updated:** 2026-08-24
**Active branch:** `dev`
**Project:** AI Creative Strategy Operating System

## Current status

ATLAS is in **integration and production-hardening**. The intelligence layer is implemented as bounded services and is now connected to a real PostgreSQL persistence adapter. The architecture remains `Intelligence + Memory + Orchestration + Specialized Agents + Tools` rather than an uncontrolled collection of autonomous agents.

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
- PostgreSQL intelligence persistence repository using the existing `@atlas/database` package and `atlas_intelligence_records` table
- Strict TypeScript workspace package for `@atlas/intelligence`

## Persistence architecture

`PersistentIntelligenceService → IntelligenceRepository → PostgresIntelligenceRepository → @atlas/database → atlas_intelligence_records`

The existing persistence migration is reused; no duplicate intelligence table was introduced. PostgreSQL writes use optimistic version sequencing (`newVersion = currentVersion + 1`) and reject stale writes. Reads and lists are explicitly scoped by business, organization and project. Evidence IDs, timestamps and JSON intelligence payloads are retained.

## Integration loop

`Business Intelligence → Strategic State → Evidence → Hypothesis → Experiment → Outcome → Learning → Intelligence Hub → Next Best Action → Orchestrator → bounded workflow → Performance → Learning`

## Production-hardening checklist

1. Connect `@atlas/intelligence` to the production runtime/orchestrator factory and dependency injection.
2. Connect Creative DNA and outcome-weighted retrieval to the existing SIEL/pgvector implementation where the semantic repository is defined.
3. Persist all intelligence entity types through the same repository boundary.
4. Connect canonical performance metrics to Creative DNA and learning records.
5. Expand end-to-end tests across research → strategy → execution → performance → learning.
6. Complete platform-specific strategy adapters.
7. Complete agency/multi-client tenant isolation and authorization checks across intelligence state and memory.
8. Validate PostgreSQL migrations, secrets, OAuth/provider scopes, scheduling, observability and deployment with real target-environment credentials.

## Architectural rule

ATLAS remains `Intelligence + Memory + Orchestration + Specialized Agents + Tools`. Agents perform bounded tasks. Intelligence systems provide context and learning. The Orchestrator coordinates execution. Campaign actions that materially change spend or account state require explicit authorization/approval policies. Cross-business or cross-client intelligence must never be mixed.

## Important note

Code-level completion is not the same as production deployment. Real credentials, external services, database instances, provider scopes, monitoring and authorized end-to-end validation still have to be configured in the target environment.
