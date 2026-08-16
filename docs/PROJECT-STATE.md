# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System  
**Version:** 0.2.0 — Architecture Complete / Engineering Foundation Starting  
**Status:** Active development  
**Development branch:** `dev`  
**Stable branch:** `main`

## Mission

Build a modular, research-first multi-agent AI system that operates like a senior creative strategy team for e-commerce brands and agencies.

## Core capabilities

- Market research
- Customer research
- Product research
- Competitor intelligence
- Positioning
- Offer strategy
- Creative angle generation
- Hook generation
- Ad script development
- Creative direction
- Landing-page/CRO strategy
- Creative testing
- Performance analysis
- Persistent brand/campaign memory
- Reusable marketing knowledge

## Architectural principles

1. Research before creation.
2. Specialized agents over one monolithic prompt.
3. Structured contracts between agents.
4. Human approval for consequential actions.
5. Evidence and source traceability where research is used.
6. Shared memory must be explicit, versioned, and auditable.
7. Knowledge and campaign data are separate concerns.
8. Provider-agnostic interfaces where practical.
9. Build incrementally; do not create speculative complexity.
10. Every major component needs tests and acceptance criteria.
11. The orchestrator coordinates; specialist agents own expertise.
12. The runtime owns execution; persistence owns durable state.

## Current phase

### Phase 2 — Engineering Foundation

Phase 1 architecture is defined. The repository is now moving from specifications into executable implementation.

## Completed

### Repository

- GitHub repository established.
- `dev` branch created from `main`.
- `main` reserved for stable/releasable work.
- Persistent project-state document established.

### Architecture

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

### Core architectural decisions

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

The creative methodology that motivated ATLAS is part of the strategic knowledge/evaluation layer, including:

- Hook-to-offer-to-landing-page message continuity
- Proof-first visual framing
- Product → multiple strategic angles
- Pain/problem angles
- Ego/status angles
- Gifting angles
- Competitor callouts
- Skepticism/scam-fatigue handling
- Creative strategy over purely editorial/video-editing execution

These are treated as testable strategic heuristics, not universal guarantees.

## Not yet implemented

- Executable backend
- Database migrations
- Agent runtime
- Model Gateway
- Workflow engine implementation
- Memory service implementation
- Knowledge/RAG implementation
- Claude Skills
- MCP tools
- Frontend/dashboard
- Automated evaluation harness
- External integrations
- Production deployment

## Active work

Move from architecture documents to the executable engineering foundation:

1. Repository/package scaffolding.
2. TypeScript configuration.
3. Environment configuration and secrets boundary.
4. Database migrations for MVP entities.
5. Core domain types and schemas.
6. Model Gateway abstraction.
7. Agent runtime.
8. Workflow state engine.
9. Memory service.
10. First vertical-slice agents.

## Decisions made

- Do not generate hundreds of speculative empty files.
- Build only components required by the current architecture and workflow.
- Keep `dev` as the active development branch.
- Keep `main` stable.
- Use durable GitHub documentation as project continuity memory in addition to chat memory.
- Preserve agent execution history and artifact versions for debugging and learning.
- Do not allow agents to perform external side effects without explicit authorization/approval in the initial version.

## Open questions / deferred decisions

- Exact authentication provider.
- Exact deployment provider.
- Exact ORM/database migration framework.
- Exact queue implementation and when Redis becomes necessary.
- Exact embedding model/dimension.
- Exact MCP tool set.
- Billing model and usage limits.
- Which external marketing integrations are included in the first production release.

These decisions should be made when their implementation phase is reached, not prematurely.

## Known issues

- The repository currently contains architecture/specification work ahead of executable implementation.
- Some documents describe conceptual interfaces that still need concrete TypeScript types and tests.
- The current state should not yet be considered production-ready.

## Continuity protocol

At the end of every major work session, update this file with:

- Current version and phase
- Completed work
- Active work
- Decisions made
- Open questions
- Known issues
- Next recommended implementation sequence

This file is the persistent project handoff for future development sessions. A new chat/session should read this file before making architectural or implementation changes.

## Next recommended sequence

1. Create executable monorepo/package structure.
2. Add TypeScript and lint/test configuration.
3. Add environment configuration with `.env.example` and secret-handling rules.
4. Implement database migrations for the MVP tables.
5. Implement shared domain types and Zod/JSON-schema validation.
6. Implement the Model Gateway interface and Claude adapter boundary.
7. Implement the Agent Runtime.
8. Implement the Workflow Engine.
9. Implement the first six vertical-slice agents.
10. Run the first end-to-end local workflow before expanding the agent catalog.
