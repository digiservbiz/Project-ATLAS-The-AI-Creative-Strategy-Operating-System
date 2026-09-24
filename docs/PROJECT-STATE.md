# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.9.6 — Tenant-Scoped Artifact Lineage  
**Status:** Active development  
**Development branch:** `dev`  
**Stable branch:** `main`

## Mission
Build a modular, research-first multi-agent AI system that operates like a senior creative strategy team and creative growth operating system for e-commerce brands and agencies.

## Current phase
### Phase 2 — Master PDR + Engineering Foundation

The Master PDR is the living source of truth for implementation.

## Official architecture
1. **SIEL — Semantic Intelligence & Embedding Layer**
2. **CCIE — Competitive Creative Intelligence Engine**
3. **AI Creative Production & Media Generation Layer**
4. **Ad Platform Integration & Execution Layer**

### End-to-end target loop
```text
Product
  ↓
Strategy
  ↓
Intelligence Decision
  ↓
Orchestrator
  ↓
Execution
  ↓
Performance
  ↓
Learning
  ↓
Next Action
  ↺
```

This deterministic loop is represented in `packages/vertical-slice` so the architecture can be exercised as one scenario before real providers/connectors are introduced.

## Engineering progress
### SIEL v1 foundation — implemented
- pgvector semantic object and embedding persistence
- tenant/project scoped retrieval
- provider/model/version lineage
- deterministic local development embedding provider
- provider-neutral embedding/repository contracts

### Artifact lineage + tenant boundary — implemented
- shared `ArtifactLineage` contract
- run, organization, project, stage, artifact and parent-artifact identifiers
- timestamp and provenance metadata
- same-tenant invariant across organization and project
- vertical-slice stage artifact chain covering all eight stages
- explicit cross-tenant isolation tests
- lineage dependency wired into the vertical-slice package

### Deterministic vertical slice — implemented
`packages/vertical-slice` now contains:
- Product input contract
- Strategy hypothesis generation
- Strategy confidence gate
- Intelligence decision gate
- Semantic retrieval support invariant
- Orchestrator execution plan
- Approval boundary
- Decision-to-execution invariant
- Deterministic performance snapshot and metric validation
- Learning record creation and evidence gate
- Next-best-action generation
- Explicit failure events
- Controlled scenario overrides for deterministic failure injection
- Stage artifact lineage and tenant/project propagation
- Full happy-path and stage-by-stage failure-hunting tests

The scenario is deliberately deterministic: fixed IDs, fixed performance numbers and fixed learning timestamp. It is a test harness, not a production execution path.

## Failure-hunting matrix
Current tests intentionally break these boundaries:
1. Product contract incomplete → `PRODUCT_INCOMPLETE`
2. Strategy confidence below threshold → `LOW_STRATEGY_CONFIDENCE`
3. Semantic retrieval mismatch → `SEMANTIC_RETRIEVAL_MISMATCH`
4. Intelligence confidence below threshold → `LOW_DECISION_CONFIDENCE`
5. Non-proceed decision reaching execution → `DECISION_BLOCKED` / `BLOCKED_DECISION_EXECUTED`
6. Approval boundary bypass → `APPROVAL_BOUNDARY_BYPASSED`
7. Invalid execution budget → `INVALID_BUDGET`
8. Impossible performance metrics → `IMPOSSIBLE_CLICK_VOLUME` / conversion-volume validation
9. Insufficient learning evidence → `INSUFFICIENT_LEARNING_EVIDENCE`
10. Missing next action → `NO_NEXT_ACTION`
11. Cross-tenant artifact relationship → `TENANT_SCOPE_VIOLATION`
12. Broken parent-artifact relationship → `ARTIFACT_LINEAGE_BROKEN`

A failure identifies the stage, stable error code, message and severity. Silent degradation is not acceptable.

## Test commands
From repository root:

```bash
pnpm --filter @atlas/vertical-slice test
pnpm --filter @atlas/vertical-slice typecheck
pnpm --filter @atlas/vertical-slice build
```

The suite is authored but has **not been executed in this ChatGPT environment**. Treat it as unverified until run locally or in GitHub Actions.

## Evidence discipline
Public ad libraries and creative-intelligence sources are market-observation inputs. They do not automatically provide verified conversion performance.

ATLAS must distinguish verified first-party performance, platform-provided public signals, and market observation.

Only authorized/publicly accessible data may be used, subject to platform terms, permissions, licenses, privacy and applicable law. ATLAS must not bypass platform restrictions.

## Existing engineering foundation
- pnpm workspace and TypeScript foundation.
- `@atlas/contracts`
- `@atlas/agent-runtime`
- `@atlas/model-gateway`
- `@atlas/workflow-engine`
- `@atlas/domain`
- `@atlas/persistence`
- `@atlas/database`
- `@atlas/agents`
- `@atlas/evaluation`
- `@atlas/intelligence`
- `@atlas/vertical-slice`
- PostgreSQL + pgvector foundation.
- Durable workflow store boundary.
- Tenant-scoped artifact lineage foundation.

## Initial specialists
1. `product-research@1.0.0`
2. `creative-strategy@1.0.0`
3. `angle-generator@1.0.0`
4. `hook-generator@1.0.0`
5. `script-writer@1.0.0`
6. `qa-validator@1.0.0`

## Not yet implemented
- Production embedding provider
- Retrieval evaluation fixtures against a real repository
- CCIE source connectors
- AI media-generation gateway/providers
- Full durable artifact persistence implementation
- Ad-platform connectors/execution
- Production end-to-end runner with real artifact passing
- Claude Skills packaging
- MCP tools
- REST API
- Frontend/dashboard
- Production integrations/deployment

## Key decisions
- PostgreSQL is transactional source of truth; pgvector is the semantic retrieval layer.
- Claude is the initial primary reasoning provider behind a provider-neutral model gateway.
- Embedding generation remains provider-neutral.
- Media generation is provider-neutral; no single image/video vendor is architecturally required.
- External platform connectors are provider-specific and permission-scoped.
- Paid execution has an explicit human-approval boundary by default.
- Generated assets retain lineage, provider/model metadata, QA results, and rights metadata.
- Public market intelligence must not be represented as verified campaign performance.
- Every vertical-slice stage now carries tenant/project/run lineage.
- The deterministic vertical slice remains the integration contract before live connectors are allowed to drive the loop.

## Continuity protocol
At every major milestone update this file with version/phase, completed work, active work, decisions, open questions, known issues, and next sequence.

## Next sequence
1. Add SIEL retrieval evaluation fixtures using the embedding/repository contracts.
2. Harden pgvector repository validation: vector dimensions, finite values, and provider/model/version matching.
3. Add a production embedding adapter behind `EmbeddingProvider`.
4. Finish PDR architecture sections for memory/RAG, integrations, API, security, observability and evaluation.
5. Implement CCIE connector contracts and normalized creative ingestion.
6. Implement media generation adapters.
7. Implement PostgreSQL repositories + durable WorkflowStore and artifact persistence.
8. Complete live Claude integration.
9. Replace deterministic strategy/execution stages with real artifact-passing agents while preserving the same contracts.
10. Add authorized Meta/TikTok/Google performance connectors and approval-controlled execution.
11. Run end-to-end evaluation.
12. Add API, Skills/MCP and dashboard foundations.
13. Prepare the local installation/demo package so the complete core can be tested locally without premature live-ad-platform credentials.
