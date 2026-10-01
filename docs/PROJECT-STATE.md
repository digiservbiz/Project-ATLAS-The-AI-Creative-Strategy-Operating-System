# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.10.4 — Runnable Local Demo Runner  
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
- durable PostgreSQL and in-memory artifact repositories

### Durable workflow foundation — implemented
- workflow run persistence contract
- PostgreSQL and in-memory workflow stores
- incremental completed-step/output persistence
- runtime exception persistence
- workflow scope mismatch persistence

### Deterministic vertical slice — implemented
`packages/vertical-slice` contains:
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
- Real stage payloads attached to artifacts
- Persistable artifact mapper

### Runnable local demo — implemented
New `@atlas/demo-runner` package:
- runs the complete deterministic Product → Next Action loop
- validates the artifact chain
- persists all eight stage artifacts into the in-memory repository
- persists a workflow run record
- exposes a stable programmatic `runDemo()` entry point
- includes CLI output for local smoke testing
- includes happy-path, failure, and tenant-isolation tests
- root command: `pnpm demo`

The demo is intentionally credential-free and uses in-memory persistence. It is the first local integration harness before PostgreSQL and live providers are required.

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
pnpm --filter @atlas/demo-runner test
pnpm --filter @atlas/demo-runner typecheck
pnpm demo
pnpm typecheck
pnpm test
pnpm build
```

The suites are authored but have **not been executed in this ChatGPT environment**. Treat them as unverified until run locally or in GitHub Actions.

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
- `@atlas/demo-runner`
- PostgreSQL + pgvector foundation.
- Durable workflow run store boundary with PostgreSQL and in-memory implementations.
- Durable artifact repository with PostgreSQL and in-memory implementations.
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
- Ad-platform connectors/execution
- Production end-to-end runner with real artifact passing through `AgentRuntime`
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
- Every vertical-slice stage carries tenant/project/run lineage.
- The deterministic vertical slice remains the integration contract before live connectors are allowed to drive the loop.
- The local demo runner is credential-free and is the first integration smoke-test surface.

## Continuity protocol
At every major milestone update this file with version/phase, completed work, active work, decisions, open questions, known issues, and next sequence.

## Next sequence
1. Wire the demo runner to the durable `WorkflowEngine` contract rather than only recording the final workflow state.
2. Add a minimal local REST API with `/health`, create-demo-run, and get-demo-run endpoints.
3. Add API/demo integration tests.
4. Add SIEL retrieval evaluation fixtures using the embedding/repository contracts.
5. Harden pgvector repository validation and add real repository tests where PostgreSQL is available.
6. Add a production embedding adapter behind `EmbeddingProvider`.
7. Finish memory/RAG, integrations, API, security, observability and evaluation PDR sections.
8. Implement CCIE connector contracts and normalized creative ingestion.
9. Implement media generation adapters.
10. Replace deterministic strategy/execution stages with real artifact-passing agents while preserving the same contracts.
11. Add authorized Meta/TikTok/Google performance connectors and approval-controlled execution.
12. Run end-to-end evaluation.
13. Add Claude Skills/MCP and dashboard foundations.
14. Prepare deployment and local installation documentation.
