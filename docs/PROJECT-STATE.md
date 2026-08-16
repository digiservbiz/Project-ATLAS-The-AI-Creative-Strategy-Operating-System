# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.5.0 — Persistence Foundation  
**Status:** Active development  
**Development branch:** `dev`  
**Stable branch:** `main`

## Mission
Build a modular, research-first multi-agent AI system that operates like a senior creative strategy team for e-commerce brands and agencies.

## Current phase
### Phase 2 — Engineering Foundation / First Vertical Slice

Architecture and executable foundations are in place. PostgreSQL persistence has now started.

## Completed
- GitHub repository, `dev` branch, stable `main`, and persistent project-state handoff.
- Architecture/specification suite covering system, technical architecture, agents, database, memory, RAG, workflows, API, roadmap, vertical slice, Claude implementation, and agent catalog.
- pnpm workspace and shared TypeScript configuration.
- `@atlas/contracts` with Zod execution/artifact contracts.
- `@atlas/agent-runtime` with registry and tool-permission enforcement.
- `@atlas/model-gateway` provider-neutral interface.
- `@atlas/workflow-engine` initial sequential execution.
- `@atlas/domain` core organization/project/brand/product/campaign types.
- `@atlas/persistence` tenant-scoped repository interfaces and in-memory implementations.
- `@atlas/agents` six initial vertical-slice specialists.
- `@atlas/database` PostgreSQL client boundary.
- Initial PostgreSQL migration with organizations, projects, brands, products, campaigns, workflow runs, agent runs, artifacts, and memories.

## Initial specialists
1. `product-research@1.0.0`
2. `creative-strategy@1.0.0`
3. `angle-generator@1.0.0`
4. `hook-generator@1.0.0`
5. `script-writer@1.0.0`
6. `qa-validator@1.0.0`

## First vertical slice
```text
Product Brief → Product Research → Creative Strategy → 20 Angles → Hooks → Script → QA → Campaign Package
```

The motivating methodology remains a strategic/evaluation layer: hook-to-offer-to-LP continuity, proof-first framing, one product/multiple angles, pain/problem, ego/status, gifting, competitor callouts, skepticism handling, and strategy over superficial editing.

## Not yet implemented
- Production database repository implementations
- Real Claude API adapter
- Durable workflow execution
- Memory/RAG services
- REST API
- Claude Skills packaging
- MCP tools
- Evaluation harness
- Frontend/dashboard
- External integrations
- Production deployment

## Active work
1. Implement PostgreSQL repositories over the new schema.
2. Implement real Claude provider adapter behind Model Gateway.
3. Add durable workflow/artifact persistence.
4. Add memory service and retrieval boundary.
5. Connect specialist agents to model/tool interfaces.
6. Add end-to-end vertical-slice integration test.
7. Build evaluation harness.

## Core decisions
- PostgreSQL is the transactional source of truth; pgvector is planned for retrieval.
- Claude is the initial primary model provider behind a provider-neutral gateway.
- Node.js + TypeScript backend; Next.js frontend later.
- REST API initially.
- Agent outputs are durable versioned artifacts.
- Human approval gates consequential external actions.
- Provider-specific SDK code stays outside core runtime.
- No speculative mass scaffolding.
- `dev` is development; `main` remains stable.

## Known issues
- Database schema requires PostgreSQL with pgcrypto and pgvector extensions.
- Model gateway has no live provider connected yet.
- Workflow execution is still in-memory/sequential.
- Specialist agents currently have deterministic foundation behavior.
- Integration/evaluation tests remain to be added.
- Not production-ready.

## Open/deferred decisions
- Authentication provider
- Deployment provider
- Exact migration runner/ORM
- Queue implementation and Redis timing
- Embedding model/dimension
- MCP tool set
- Billing/usage limits
- Production marketing integrations

## Continuity protocol
At every major milestone update this file with version/phase, completed work, active work, decisions, open questions, known issues, and next sequence. A new session should read this file before architectural or implementation changes.

## Next sequence
1. PostgreSQL repository implementations.
2. Claude provider adapter.
3. Durable workflow/artifact store.
4. Memory service.
5. End-to-end vertical-slice runner.
6. Evaluation tests.
7. API foundation.
8. Claude Skills and MCP integration.
9. Dashboard foundation.
