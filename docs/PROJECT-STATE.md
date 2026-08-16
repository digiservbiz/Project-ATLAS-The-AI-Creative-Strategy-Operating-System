# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.3.0 — Engineering Foundation Started  
**Status:** Active development  
**Development branch:** `dev`  
**Stable branch:** `main`

## Mission

Build a modular, research-first multi-agent AI system that operates like a senior creative strategy team for e-commerce brands and agencies.

## Current phase

### Phase 2 — Engineering Foundation

Architecture is defined and the executable monorepo foundation has started.

## Completed

### Repository

- GitHub repository established.
- `dev` branch created from `main`.
- `main` reserved for stable work.
- Persistent project-state document established.

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

- Root `package.json` created.
- pnpm workspace created.
- Shared TypeScript configuration created.
- `.env.example` created.
- `.gitignore` created with secret/local-file protection.
- `@atlas/contracts` package created.
- Initial Zod execution/artifact contracts created.
- `@atlas/agent-runtime` package created.
- Agent registry and tool-permission enforcement implemented.
- `@atlas/model-gateway` package created.
- Provider-neutral model gateway interface implemented.
- `@atlas/workflow-engine` package created.
- Initial sequential workflow execution implemented.

## Core architectural decisions

- PostgreSQL is the initial transactional source of truth.
- pgvector is the initial vector-search approach.
- Claude is the initial primary model provider, accessed through a provider-neutral Model Gateway.
- Backend default: Node.js + TypeScript.
- Frontend default: Next.js + TypeScript.
- API starts as REST.
- Workflow execution is durable and stateful.
- Agent outputs are versioned artifacts rather than disposable chat responses.
- Human approval gates consequential external actions.
- The first vertical slice is intentionally small and end-to-end.
- The monorepo uses pnpm workspaces with `apps/*` and `packages/*`.
- Shared contracts are centralized so runtime, workflows, and future API layers use the same validation boundary.

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

The creative methodology that motivated ATLAS is part of the strategic knowledge/evaluation layer, including hook-to-offer-to-LP continuity, proof-first framing, one product/multiple angles, pain/problem, ego/status, gifting, competitor callouts, skepticism handling, and strategy over superficial editing. These are testable heuristics, not universal guarantees.

## Not yet implemented

- Database migrations
- Persistent repository implementations
- Claude provider adapter using the real API
- Memory service implementation
- Knowledge/RAG implementation
- Full durable workflow persistence
- First vertical-slice specialist agents
- Claude Skills
- MCP tools
- REST API application
- Frontend/dashboard
- Automated evaluation harness
- External integrations
- Production deployment

## Active work

1. Add database migration layer and MVP schema.
2. Add shared domain entities and validation schemas.
3. Implement real persistence interfaces.
4. Implement Claude provider adapter behind Model Gateway.
5. Upgrade workflow engine toward durable state and artifact persistence.
6. Implement memory service.
7. Implement first vertical-slice agents.
8. Add tests and evaluation fixtures.

## Decisions made

- Do not generate hundreds of speculative empty files.
- Build only components required by the current architecture and workflow.
- Keep `dev` as active development branch and `main` stable.
- Use GitHub documentation as persistent project continuity memory in addition to chat memory.
- Preserve agent execution history and artifact versions.
- Do not allow agents to perform external side effects without explicit authorization/approval in the initial version.
- Keep provider-specific SDK code outside the core agent runtime.

## Open questions / deferred decisions

- Exact authentication provider.
- Exact deployment provider.
- Exact ORM/database migration framework.
- Exact queue implementation and when Redis becomes necessary.
- Exact embedding model/dimension.
- Exact MCP tool set.
- Billing model and usage limits.
- Production external marketing integrations.

## Known issues

- The executable packages are foundation-level and need integration tests.
- Workflow execution is currently in-memory/sequential and is not yet durable.
- The model gateway is an interface only; no production provider adapter is connected yet.
- Database persistence has not yet been implemented.
- The repository is not production-ready.

## Continuity protocol

At the end of every major work session, update this file with current version/phase, completed work, active work, decisions, open questions, known issues, and the next implementation sequence. A new chat/session should read this file before making architectural or implementation changes.

## Next recommended sequence

1. Database migration/schema package.
2. Domain model package.
3. Repository interfaces + PostgreSQL implementation.
4. Claude provider adapter.
5. Durable workflow persistence.
6. Memory repository/service.
7. First vertical-slice agents.
8. End-to-end integration test.
9. Evaluation harness.
10. API and dashboard foundations.
