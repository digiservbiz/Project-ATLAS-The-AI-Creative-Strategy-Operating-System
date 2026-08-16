# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.4.0 — Vertical Slice Code Started  
**Status:** Active development  
**Development branch:** `dev`  
**Stable branch:** `main`

## Mission
Build a modular, research-first multi-agent AI system that operates like a senior creative strategy team for e-commerce brands and agencies.

## Current phase
### Phase 2 — Engineering Foundation / First Vertical Slice

Architecture and core interfaces are defined. Executable packages now exist for contracts, agent runtime, model gateway, workflow engine, domain types, persistence abstractions, and initial specialist agents.

## Completed

### Repository & safety
- GitHub repository established.
- `dev` branch active; `main` remains stable.
- Persistent project-state document established and maintained.
- `.env.example` added; real secrets are not committed.
- `.gitignore` added for secrets/build artifacts/local files.

### Architecture/specification
- Executive summary
- Product vision
- System architecture
- Technical architecture
- Agent contract specification
- Database schema specification
- Memory system specification
- Knowledge/RAG specification
- Workflow engine specification
- API specification
- Implementation roadmap
- First vertical-slice specification
- Claude implementation guide
- Agent catalog

### Executable foundation
- pnpm workspace with `apps/*` and `packages/*`.
- Shared TypeScript configuration.
- `@atlas/contracts` with Zod execution/artifact contracts.
- `@atlas/agent-runtime` with registry and tool permission enforcement.
- `@atlas/model-gateway` with provider-neutral provider interface.
- `@atlas/workflow-engine` with sequential workflow execution.
- `@atlas/domain` with core Organization/Project/Brand/Product/Campaign types.
- `@atlas/persistence` with tenant-scoped repository interfaces and in-memory development implementations.
- `@atlas/agents` with six initial vertical-slice specialists.

### Initial specialists implemented
1. `product-research@1.0.0`
2. `creative-strategy@1.0.0`
3. `angle-generator@1.0.0`
4. `hook-generator@1.0.0`
5. `script-writer@1.0.0`
6. `qa-validator@1.0.0`

These are foundation implementations. They intentionally avoid pretending that placeholder outputs are real research until retrieval/tools are connected.

## First vertical slice
```text
Product Brief
    ↓
Product Research Agent
    ↓
Creative Strategy Agent
    ↓
20-Angle Generator
    ↓
Hook Generator
    ↓
Script Writer
    ↓
QA Validator
    ↓
Campaign Strategy Package
```

The motivating creative methodology remains a strategic/evaluation layer: hook-to-offer-to-LP continuity, proof-first framing, one product/multiple angles, pain/problem, ego/status, gifting, competitor callouts, skepticism handling, and creative strategy over superficial editing. These are testable heuristics, not universal guarantees.

## Not yet implemented
- PostgreSQL migrations and real database adapter
- Real Claude API provider adapter
- Durable workflow persistence
- Memory service
- Knowledge/RAG service
- REST API app
- Claude Skills packaging
- MCP tools
- Automated evaluation harness
- Frontend/dashboard
- External marketing integrations
- Production deployment

## Active work
1. Add MVP PostgreSQL schema/migrations.
2. Implement database repositories.
3. Implement Claude provider adapter behind Model Gateway.
4. Add durable workflow/artifact persistence.
5. Add memory service and retrieval boundary.
6. Connect specialist agents to model/tool interfaces.
7. Add end-to-end vertical-slice integration test.
8. Build evaluation harness.

## Core decisions
- PostgreSQL is the transactional source of truth; pgvector is planned for retrieval.
- Claude is the initial primary model provider behind a provider-neutral gateway.
- Node.js + TypeScript backend; Next.js frontend later.
- REST API initially.
- Agent outputs are durable versioned artifacts.
- Human approval gates consequential external actions.
- Provider-specific SDK code stays outside core runtime.
- No speculative mass scaffolding; build only what the current slice requires.
- `dev` is the development branch; `main` remains stable.

## Known issues
- The model gateway is currently an interface; no live provider is connected.
- Workflow execution is currently in-memory and sequential.
- Persistence is currently abstraction + in-memory implementations only.
- Specialist agents currently use deterministic foundation outputs rather than live research/model calls.
- Integration/evaluation tests are still required.
- Not production-ready.

## Open/deferred decisions
- Authentication provider
- Deployment provider
- Exact ORM/migration framework
- Queue implementation and Redis timing
- Embedding model/dimension
- MCP tool set
- Billing/usage limits
- Production marketing integrations

## Continuity protocol
At every major milestone update this file with version/phase, completed work, active work, decisions, open questions, known issues, and next sequence. A new session should read this file before making architectural or implementation changes.

## Next sequence
1. Database migration/schema package.
2. PostgreSQL repositories.
3. Claude provider adapter.
4. Durable workflow/artifact store.
5. Memory service.
6. End-to-end vertical-slice runner.
7. Evaluation tests.
8. API foundation.
9. Claude Skills and MCP integration.
10. Dashboard foundation.
