# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.11.0 — Workflow-Engine Demo + Local REST API  
**Status:** Active development  
**Development branch:** `dev`  
**Stable branch:** `main`

## Mission
Build a modular, research-first multi-agent AI system that operates like a senior creative strategy team and creative growth operating system for e-commerce brands and agencies.

## Current phase
### Phase 2 — Master PDR + Engineering Foundation

## Official architecture
1. SIEL — Semantic Intelligence & Embedding Layer
2. CCIE — Competitive Creative Intelligence Engine
3. AI Creative Production & Media Generation Layer
4. Ad Platform Integration & Execution Layer

## End-to-end target loop
Product → Strategy → Intelligence Decision → Orchestrator → Execution → Performance → Learning → Next Action → loop.

## Completed foundation
- Provider-neutral contracts and model gateway foundation.
- SIEL pgvector persistence, embedding identity and deterministic local embedding provider.
- Tenant/project/run-scoped artifact lineage.
- PostgreSQL and in-memory artifact repositories.
- PostgreSQL and in-memory durable workflow stores.
- WorkflowEngine incremental persistence, fail-fast execution, runtime exception handling and scope validation.
- Deterministic eight-stage vertical slice with failure injection.
- Real stage payloads attached to lineage artifacts.
- Credential-free demo runner.
- Demo runner now executes its workflow through AgentRuntime + WorkflowEngine.
- Local REST API now exposes the demo loop.

## Runnable local surface
Root:
```bash
pnpm demo
pnpm dev
```

API:
- `GET /health`
- `GET /v1/runtime/status`
- `POST /v1/demo/runs`
- `GET /v1/demo/runs/:id`
- Existing intelligence/autonomous endpoints remain available.

The local API is safe-local: no external ad spend or publishing is performed.

## Test commands
```bash
pnpm --filter @atlas/demo-runner test
pnpm --filter @atlas/demo-runner typecheck
pnpm --filter @atlas/api typecheck
pnpm --filter @atlas/api test
pnpm typecheck
pnpm test
pnpm build
```

Tests are authored but remain unverified in this ChatGPT environment because the repository cannot be fully installed/executed here. GitHub Actions or local execution must be used for definitive pass/fail status.

## Not yet production-complete
- Production embedding provider
- Real SIEL retrieval evaluation against PostgreSQL
- CCIE source connectors and normalized ingestion
- Media generation adapters
- Real ad-platform connectors/execution
- Production artifact-passing specialists replacing deterministic demo agents
- Claude production integration
- MCP/Skills
- persistent API storage/authentication
- observability/queues/recovery
- frontend/dashboard
- deployment hardening

## Safety/architecture decisions
- PostgreSQL is transactional source of truth; pgvector is semantic retrieval.
- External platform connectors are permission-scoped.
- Paid execution requires explicit human approval by default.
- Public market observation is never represented as verified first-party performance.
- Every stage carries organization/project/run lineage.
- Local demo execution performs no external spend or publishing.

## Next sequence
1. Execute the complete repository CI and fix any compile/test failures.
2. Add API integration tests to CI.
3. Add SIEL retrieval fixtures and PostgreSQL test path.
4. Implement production embedding adapter.
5. Implement CCIE ingestion/connectors.
6. Implement production artifact-passing agents.
7. Add Claude provider and evaluation controls.
8. Add persistent authenticated API.
9. Add Meta/TikTok/Google connectors with approval gates.
10. Build dashboard.
11. Add deployment, observability, queue/recovery and security hardening.
12. Run full end-to-end evaluation.
