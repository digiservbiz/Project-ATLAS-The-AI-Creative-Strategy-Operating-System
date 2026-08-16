# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.6.0 — Durable Workflow + Evaluation Foundation  
**Status:** Active development  
**Development branch:** `dev`  
**Stable branch:** `main`

## Mission
Build a modular, research-first multi-agent AI system that operates like a senior creative strategy team for e-commerce brands and agencies.

## Current phase
### Phase 2 — Engineering Foundation / First Vertical Slice

Executable foundations, database schema, durable workflow boundary, and the first evaluation layer are now in place.

## Completed
- GitHub repository, `dev` branch, stable `main`, and persistent project-state handoff.
- Architecture/specification suite covering system, technical architecture, agents, database, memory, RAG, workflows, API, roadmap, vertical slice, Claude implementation, and agent catalog.
- pnpm workspace and shared TypeScript configuration.
- `@atlas/contracts` with Zod execution/artifact contracts.
- `@atlas/agent-runtime` with registry and tool-permission enforcement.
- `@atlas/model-gateway` provider-neutral interface plus provider boundary.
- `@atlas/workflow-engine` initial sequential execution.
- Durable workflow store boundary with run/step status persistence hooks.
- `@atlas/domain` core organization/project/brand/product/campaign types.
- `@atlas/persistence` tenant-scoped repository interfaces and in-memory implementations.
- `@atlas/database` PostgreSQL client boundary.
- Initial PostgreSQL migration with organizations, projects, brands, products, campaigns, workflow runs, agent runs, artifacts, and memories.
- `@atlas/agents` six initial vertical-slice specialists.
- `@atlas/evaluation` initial evaluation harness and creative-strategy baseline cases.

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
- Production PostgreSQL repository implementations
- Fully wired live Claude API execution
- Persistent memory retrieval service
- Full durable artifact persistence implementation
- End-to-end runner connecting all six specialists with artifact passing
- REST API
- Claude Skills packaging
- MCP tools
- Frontend/dashboard
- External integrations
- Production deployment

## Active work
1. Implement PostgreSQL repositories over the schema.
2. Complete the live Claude provider adapter and environment validation.
3. Implement PostgreSQL-backed WorkflowStore and artifact persistence.
4. Implement memory retrieval/write service.
5. Build the first end-to-end vertical-slice runner.
6. Expand evaluation cases and integration tests.
7. Add API foundation.

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
- Live provider requires a real `ANTHROPIC_API_KEY` at runtime and must never be committed.
- Durable workflow currently has an interface but needs a concrete PostgreSQL store.
- Specialist agents still contain deterministic foundation behavior and need model/tool integration.
- Evaluation harness is structural/baseline-level, not a substitute for human or production performance evaluation.
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
1. PostgreSQL repositories + durable WorkflowStore.
2. Complete Claude provider integration.
3. Memory service.
4. End-to-end vertical-slice runner.
5. Integration/evaluation tests.
6. API foundation.
7. Claude Skills and MCP integration.
8. Dashboard foundation.
