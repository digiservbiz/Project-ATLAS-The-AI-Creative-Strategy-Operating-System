# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.9.4 — Deterministic Vertical Slice  
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

This deterministic loop is now represented in `packages/vertical-slice` so the architecture can be exercised as one scenario before real providers/connectors are introduced.

## Engineering progress
### SIEL v1 foundation — implemented
- pgvector semantic object and embedding persistence
- tenant/project scoped retrieval
- provider/model/version lineage
- deterministic local development embedding provider
- provider-neutral embedding/repository contracts

### Deterministic vertical slice — implemented
`packages/vertical-slice` now contains:
- Product input contract
- Strategy hypothesis generation
- Intelligence decision gate
- Orchestrator execution plan
- Approval boundary
- Deterministic performance snapshot
- Learning record creation
- Next-best-action generation
- Explicit failure events
- Full scenario test covering the eight-stage loop
- Negative test for an incomplete product contract

The scenario is deliberately deterministic: fixed IDs, fixed performance numbers and fixed learning timestamp. It is a test harness, not a production execution path.

## Failure-hunting mode
The next engineering objective is to use the deterministic scenario as a contract test and intentionally break one boundary at a time.

Initial failure classes:
1. Product contract incomplete
2. Strategy hypothesis below confidence threshold
3. Intelligence retrieval mismatch
4. Orchestrator approval boundary bypass
5. Invalid execution parameters
6. Missing/insufficient performance evidence
7. Learning generated from insufficient evidence
8. No next action after learning
9. Cross-tenant data leakage
10. Unsupported action promoted to execution

A failure must identify the stage, stable error code, message and severity. Silent degradation is not acceptable.

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

## Initial specialists
1. `product-research@1.0.0`
2. `creative-strategy@1.0.0`
3. `angle-generator@1.0.0`
4. `hook-generator@1.0.0`
5. `script-writer@1.0.0`
6. `qa-validator@1.0.0`

## Not yet implemented
- Production embedding provider
- Retrieval evaluation fixtures beyond the deterministic vertical slice
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
- The deterministic vertical slice is the current integration contract before live connectors are allowed to drive the loop.

## Continuity protocol
At every major milestone update this file with version/phase, completed work, active work, decisions, open questions, known issues, and next sequence.

## Next sequence
1. Add deliberate failure-injection tests for every stage of the deterministic loop.
2. Add SIEL retrieval evaluation fixtures and tests.
3. Add a production embedding adapter behind `EmbeddingProvider`.
4. Finish PDR architecture sections for memory/RAG, integrations, API, security, observability and evaluation.
5. Implement CCIE connector contracts and normalized creative ingestion.
6. Implement media generation adapters.
7. Implement PostgreSQL repositories + durable WorkflowStore.
8. Complete live Claude integration.
9. Replace deterministic strategy/execution stages with real artifact-passing agents while preserving the same contracts.
10. Add authorized Meta/TikTok/Google performance connectors and approval-controlled execution.
11. Run end-to-end evaluation.
12. Add API, Skills/MCP and dashboard foundations.
