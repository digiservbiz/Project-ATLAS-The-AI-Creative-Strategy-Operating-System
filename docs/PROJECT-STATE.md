# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.9.2 — SIEL Contracts + Creative Intelligence Architecture  
**Status:** Active development  
**Development branch:** `dev`  
**Stable branch:** `main`

## Mission
Build a modular, research-first multi-agent AI system that operates like a senior creative strategy team and creative growth operating system for e-commerce brands and agencies.

## Current phase
### Phase 2 — Master PDR + Engineering Foundation

The Master PDR is the living source of truth for implementation.

## PDR sections added
- `docs/PDR/00-MASTER-INDEX.md`
- `docs/PDR/01-EXECUTIVE-SUMMARY.md`
- `docs/PDR/02-PRODUCT-REQUIREMENTS.md`
- `docs/PDR/07-CREATIVE-STRATEGY-ENGINE.md`
- `docs/PDR/08-SEMANTIC-INTELLIGENCE-AND-EMBEDDING-LAYER.md`
- `docs/PDR/13-COMPETITIVE-CREATIVE-INTELLIGENCE-ENGINE.md`
- `docs/PDR/14-AI-CREATIVE-PRODUCTION-AND-MEDIA-GENERATION.md`
- `docs/PDR/15-AD-PLATFORM-INTEGRATION-AND-EXECUTION.md`

## Official architecture
ATLAS now explicitly includes four connected intelligence/execution layers:

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
Added `packages/contracts/src/intelligence.ts` containing:
- semantic object types
- tenant/project-scoped semantic object schema
- versioned embedding record schema
- semantic search request/response schemas
- provider-neutral `EmbeddingProvider` interface
- provider-neutral `SemanticRepository` interface

These are contracts only; they do not yet implement embedding generation or pgvector retrieval.

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
- PostgreSQL initial migration with pgvector extension.
- Durable workflow store boundary.

## Initial specialists
1. `product-research@1.0.0`
2. `creative-strategy@1.0.0`
3. `angle-generator@1.0.0`
4. `hook-generator@1.0.0`
5. `script-writer@1.0.0`
6. `qa-validator@1.0.0`

## Not yet implemented
- Remaining complete PDR sections
- Production PostgreSQL repositories
- Fully wired live Claude execution
- SIEL v1 implementation and embedding provider
- CCIE source connectors
- AI media-generation gateway/providers
- Persistent memory retrieval service
- Full durable artifact persistence implementation
- Ad-platform connectors/execution
- End-to-end runner with artifact passing
- Claude Skills packaging
- MCP tools
- REST API
- Frontend/dashboard
- Production integrations/deployment

## Active work
1. Complete remaining Master PDR sections.
2. Convert PDR requirements into agent/skill contracts.
3. Implement SIEL embedding provider and pgvector repository.
4. Implement CCIE normalized creative store and first permitted connector.
5. Implement media-generation gateway contracts.
6. Implement PostgreSQL repositories and durable WorkflowStore.
7. Complete live Claude provider integration.
8. Implement memory/RAG.
9. Build end-to-end vertical slice.
10. Add authorized ad-platform intelligence/execution adapters.
11. Expand evaluation suite.

## Key decisions
- PostgreSQL is transactional source of truth; pgvector is planned for semantic retrieval.
- Claude is the initial primary reasoning provider behind a provider-neutral model gateway.
- Media generation is provider-neutral; no single image/video vendor is architecturally required.
- External platform connectors are provider-specific and permission-scoped.
- Paid execution has an explicit human-approval boundary by default.
- Generated assets retain lineage, provider/model metadata, QA results, and rights metadata.
- Public market intelligence must not be represented as verified campaign performance.

## Continuity protocol
At every major milestone update this file with version/phase, completed work, active work, decisions, open questions, known issues, and next sequence. A new session should read this file before architectural or implementation changes.

## Next sequence
1. Implement SIEL embedding provider abstraction and pgvector semantic repository.
2. Add retrieval evaluation fixtures and tests.
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
