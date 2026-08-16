# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.7.0 — Master PDR v1.0 Started  
**Status:** Active development  
**Development branch:** `dev`  
**Stable branch:** `main`

## Mission
Build a modular, research-first multi-agent AI system that operates like a senior creative strategy team for e-commerce brands and agencies.

## Current phase
### Phase 2 — Engineering Foundation + Master PDR

The Master PDR is now being built directly in `docs/PDR/` as a structured living specification. The PDR is the source of truth for implementation; code is not considered complete merely because a requirement is documented.

## PDR v1.0 added
- `docs/PDR/00-MASTER-INDEX.md`
- `docs/PDR/01-EXECUTIVE-SUMMARY.md`
- `docs/PDR/02-PRODUCT-REQUIREMENTS.md`
- `docs/PDR/07-CREATIVE-STRATEGY-ENGINE.md`

The index defines the planned complete PDR map covering product, architecture, multi-agent system, skills, research, RAG, memory, workflows, models, tools/MCP, database, API, frontend, evaluation, security, observability, integrations, deployment and roadmap.

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
- PostgreSQL initial migration.
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
4. Complete live Claude provider integration.
5. Implement memory/RAG.
6. Build end-to-end vertical slice.
7. Expand evaluation suite.

## Continuity protocol
At every major milestone update this file with version/phase, completed work, active work, decisions, open questions, known issues, and next sequence. A new session should read this file before architectural or implementation changes.

## Next PDR sections
1. System architecture
2. Multi-agent architecture
3. Agent catalog
4. Skills system
5. Research intelligence
6. Knowledge/RAG
7. Memory
8. Workflow engine
9. Model gateway
10. Tools/MCP
11. Database
12. API/frontend
13. Evaluation/security/observability
14. Integrations/deployment
15. Implementation roadmap
