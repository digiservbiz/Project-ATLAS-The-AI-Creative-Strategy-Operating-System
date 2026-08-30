# ATLAS Decision Log

Purpose: append-only record of important architectural and engineering decisions. New decisions should include context, decision, rationale, alternatives considered, consequences, and status.

## ADR-001 — Preserve the existing ATLAS architecture
- **Date:** 2026-08-23
- **Status:** Accepted
- **Decision:** Extend the existing Orchestration + Intelligence + Memory + Specialized Agents + Tools architecture rather than redesigning ATLAS from scratch.
- **Rationale:** The existing `dev` architecture already provides orchestration, research, strategy, creative, CRO, analytics, memory, RAG, pgvector, SIEL/embeddings, provenance, approval, evaluation, and integrations.
- **Consequence:** New capabilities must integrate with existing components and remain bounded; avoid unnecessary autonomous agents and duplicate systems.

## ADR-002 — Make intelligence business-agnostic
- **Date:** 2026-08-23
- **Status:** Accepted
- **Decision:** Model Business, Brand, Product, Service, Offer, Audience, Market, Competitors, Channels, and Campaigns as normalized intelligence concepts.
- **Rationale:** ATLAS must support e-commerce, SaaS, services, local businesses, digital products, courses, personal brands, agencies, real estate, automotive, and other business models.
- **Consequence:** Product Intelligence is a specialization, not the foundation of ATLAS.

## ADR-003 — Strategic State is the strategic source of truth
- **Date:** 2026-08-23
- **Status:** Accepted
- **Decision:** Maintain persistent Strategic State containing objectives, business model, audiences, problems, desires, objections, positioning, messaging, offers, competition, hypotheses, experiments, performance, learnings, assumptions, confidence, and next actions.
- **Rationale:** Orchestration needs persistent context rather than isolated workflow outputs.
- **Consequence:** Learning and intelligence signals must feed back into Strategic State.

## ADR-004 — Evidence must remain distinguishable from inference
- **Date:** 2026-08-23
- **Status:** Accepted
- **Decision:** Strategic reasoning must distinguish observed evidence, user-provided facts, hypotheses, assumptions, recommendations, and confidence.
- **Rationale:** Similarity and correlation must not be silently promoted to causation or fact.
- **Consequence:** Provenance and confidence travel with intelligence records and learnings.

## ADR-005 — Experiments test explicit variables
- **Date:** 2026-08-23
- **Status:** Accepted
- **Decision:** Creative experimentation must explicitly identify the strategic variable being tested and avoid changing multiple strategic variables when causal learning is the objective.
- **Rationale:** ATLAS should learn why an outcome occurred, not merely observe that one creative won.
- **Consequence:** Hypothesis, variants, metrics, sample size, measurement period, outcome, and learning are structured records.

## ADR-006 — Outcome-weighted semantic intelligence
- **Date:** 2026-08-23
- **Status:** Accepted
- **Decision:** SIEL retrieval should rank historical concepts using semantic relevance together with performance, recency, audience, platform, market, objective, creative type, and confidence.
- **Rationale:** The most semantically similar creative is not necessarily the most strategically useful precedent.
- **Consequence:** Creative DNA must be linked to measurable outcomes and retrievable through semantic memory.

## ADR-007 — Intelligence drives orchestration, not a proliferation of agents
- **Date:** 2026-08-23
- **Status:** Accepted
- **Decision:** The Intelligence Hub supplies context and Next Best Actions to the existing Orchestrator through bounded adapters.
- **Rationale:** ATLAS should remain an operating system, not hundreds of loosely coordinated agents.
- **Consequence:** Workflow selection is intelligence-driven while execution remains within existing orchestration boundaries.

## ADR-008 — Cross-business and cross-client isolation is mandatory
- **Date:** 2026-08-23
- **Status:** Accepted
- **Decision:** Intelligence, memory, research, creative history, performance data, and integrations must remain scoped to the owning business/client.
- **Rationale:** Prevent contamination of strategic knowledge between businesses and agency clients.
- **Consequence:** Persistence and retrieval interfaces must enforce business/client scope.

## ADR-009 — Code implementation is not production deployment
- **Date:** 2026-08-23
- **Status:** Accepted
- **Decision:** ATLAS is not considered production-ready until runtime integration, persistence, provider credentials/scopes, observability, deployment, and authorized end-to-end validation are complete.
- **Rationale:** Intelligence contracts alone do not constitute a functioning production operating system.
- **Consequence:** Production hardening and integration tests remain explicit milestones.
