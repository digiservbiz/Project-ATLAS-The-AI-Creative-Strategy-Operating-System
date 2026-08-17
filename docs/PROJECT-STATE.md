# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.9.1 — Connector Contracts + Creative Intelligence Architecture  
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
3. Define shared provider/connector interfaces.
4. Implement SIEL interfaces, embeddings and pgvector retrieval.
5. Implement CCIE normalized creative store and first permitted connector.
6. Implement media-generation gateway contracts.
7. Implement PostgreSQL repositories and durable WorkflowStore.
8. Complete live Claude provider integration.
9. Implement memory/RAG.
10. Build end-to-end vertical slice.
11. Add authorized ad-platform intelligence/execution adapters.
12. Expand evaluation suite.

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
1. Finish PDR architecture sections for memory/RAG, integrations, API, security, observability and evaluation.
2. Define SIEL + CCIE + media gateway interfaces.
3. Implement SIEL/pgvector retrieval.
4. Implement PostgreSQL repositories + durable WorkflowStore.
5. Complete live Claude integration.
6. Implement memory/RAG.
7. Wire the six-agent vertical slice.
8. Add CCIE connectors.
9. Add media generation adapters.
10. Add authorized Meta/TikTok/Google performance connectors and approval-controlled execution.
11. Run end-to-end evaluation.
12. Add API, Skills/MCP and dashboard foundations.
