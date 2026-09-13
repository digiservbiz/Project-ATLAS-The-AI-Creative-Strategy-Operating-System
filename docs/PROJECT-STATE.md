# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.9.3 — SIEL v1 Foundation  
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
Public/authorized market intelligence
          ↓
Competitive Creative Intelligence
          ↓
Research + customer/product intelligence
          ↓
Semantic Intelligence + Memory/RAG
          ↓
Creative Strategy
          ↓
Angles / Hooks / Scripts / Offers / LP messaging
          ↓
AI Creative Production
          ↓
Creative QA
          ↓
Human approval
          ↓
Meta / TikTok / Google execution
          ↓
First-party performance data
          ↓
Analytics + semantic learning
          ↓
New hypotheses and creative tests
```

## Engineering progress
### Shared SIEL contracts — implemented
`packages/contracts/src/intelligence.ts` defines semantic objects, embedding records, search request/response schemas, `EmbeddingProvider`, and `SemanticRepository`.

### SIEL v1 foundation — implemented
- `packages/database/migrations/001_siel.sql`
  - pgvector extension
  - tenant-scoped semantic object table
  - embedding table with provider/model/version lineage
  - tenant/object-type index
- `packages/intelligence/src/local-hash-embedding.ts`
  - deterministic local embedding provider for development/tests
  - provider-neutral contract implementation
- `packages/intelligence/src/pgvector-repository.ts`
  - semantic object upsert
  - embedding persistence
  - tenant/project scoped cosine-distance retrieval
  - object-type filtering
  - provenance in search results
- Existing `@atlas/intelligence` package exports were preserved and extended with the new SIEL components.

The local hash provider is a development/testing implementation, not a production-quality semantic model.

## Evidence discipline
Public ad libraries and creative-intelligence sources are market-observation inputs. They do not automatically provide verified conversion performance.

ATLAS must distinguish:
- verified first-party performance;
- platform-provided public performance signals;
- market observation.

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
- PostgreSQL + pgvector foundation.
- Durable workflow store boundary.
- Existing intelligence, tenant authorization, learning and persistence components in `@atlas/intelligence` are preserved.

## Initial specialists
1. `product-research@1.0.0`
2. `creative-strategy@1.0.0`
3. `angle-generator@1.0.0`
4. `hook-generator@1.0.0`
5. `script-writer@1.0.0`
6. `qa-validator@1.0.0`

## Not yet implemented
- Production embedding provider
- Retrieval evaluation fixtures/tests
- CCIE source connectors
- AI media-generation gateway/providers
- Full durable artifact persistence implementation
- Ad-platform connectors/execution
- End-to-end runner with artifact passing
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

## Continuity protocol
At every major milestone update this file with version/phase, completed work, active work, decisions, open questions, known issues, and next sequence.

## Next sequence
1. Add SIEL retrieval evaluation fixtures and tests.
2. Add a production embedding adapter behind `EmbeddingProvider`.
3. Finish PDR architecture sections for memory/RAG, integrations, API, security, observability and evaluation.
4. Implement CCIE connector contracts and normalized creative ingestion.
5. Implement media generation adapters.
6. Implement PostgreSQL repositories + durable WorkflowStore.
7. Complete live Claude integration.
8. Implement memory/RAG.
9. Wire the six-agent vertical slice.
10. Add authorized Meta/TikTok/Google performance connectors and approval-controlled execution.
11. Run end-to-end evaluation.
12. Add API, Skills/MCP and dashboard foundations.
