# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.8.0 — Semantic Intelligence Layer Incorporated  
**Status:** Active development  
**Development branch:** `dev`  
**Stable branch:** `main`

## Mission
Build a modular, research-first multi-agent AI system that operates like a senior creative strategy team for e-commerce brands and agencies.

## Current phase
### Phase 2 — Engineering Foundation + Master PDR

The Master PDR is being built directly in `docs/PDR/` as a structured living specification. The PDR is the source of truth for implementation.

## PDR v1.0 added
- `docs/PDR/00-MASTER-INDEX.md`
- `docs/PDR/01-EXECUTIVE-SUMMARY.md`
- `docs/PDR/02-PRODUCT-REQUIREMENTS.md`
- `docs/PDR/07-CREATIVE-STRATEGY-ENGINE.md`
- `docs/PDR/08-SEMANTIC-INTELLIGENCE-AND-EMBEDDING-LAYER.md`

## Official architecture addition: SIEL
The **Semantic Intelligence & Embedding Layer (SIEL)** is now an official ATLAS subsystem.

SIEL is not merely vector storage. It provides the semantic capabilities required for:
- embedding generation
- semantic retrieval
- similarity matching
- creative deduplication
- clustering
- pattern discovery
- semantic memory retrieval
- hook/landing-page semantic continuity analysis
- angle-gap detection
- historical creative retrieval

SIEL is provider-neutral, versioned, tenant-scoped, provenance-aware, and designed for hybrid retrieval over PostgreSQL + pgvector.

The exact embedding model and vector dimension remain configurable implementation decisions. The existing database `memories.embedding` field is infrastructure groundwork, not proof that SIEL v1 is fully implemented.

## Strategic methodology encoded
- Hook-to-offer-to-LP continuity
- Proof-first framing
- One product / many materially different hypotheses
- Pain/problem, benefit, proof, ego/status, gifting, competitor, objection, curiosity, demonstration and other angle families
- Skepticism/scam-fatigue handling through credible evidence
- Direct-response orientation
- Strategist vs editor distinction
- Evidence discipline and anti-fabrication requirements
- Hypothesis-driven testing

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
- Persistent memory retrieval service
- Full durable artifact persistence implementation
- End-to-end runner with artifact passing
- Claude Skills packaging
- MCP tools
- REST API
- Frontend/dashboard
- Production integrations/deployment

## Active work
1. Complete Master PDR v1.0 sections.
2. Convert PDR requirements into agent/skill contracts.
3. Implement PostgreSQL repositories and durable WorkflowStore.
4. Implement SIEL provider interface, embedding pipeline, and pgvector retrieval.
5. Complete live Claude provider integration.
6. Implement memory/RAG.
7. Build end-to-end vertical slice.
8. Expand evaluation suite.

## Continuity protocol
At every major milestone update this file with version/phase, completed work, active work, decisions, open questions, known issues, and next sequence. A new session should read this file before architectural or implementation changes.

## Next sequence
1. Complete remaining PDR architecture sections.
2. Define SIEL interfaces and evaluation dataset.
3. Implement embedding provider abstraction.
4. Implement pgvector semantic repository and hybrid retrieval.
5. Implement PostgreSQL repositories + durable WorkflowStore.
6. Complete live Claude integration.
7. Implement memory/RAG.
8. Wire the six-agent end-to-end workflow.
9. Run evaluation suite.
10. Add API, Skills/MCP, and dashboard foundations.
