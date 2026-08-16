# ATLAS Project State

**Project:** ATLAS — AI Creative Strategy Operating System
**Version:** 0.1.0 — Foundation
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

## Current phase

### Phase 1 — Foundation & Architecture

Initial objectives:

- Establish repository conventions.
- Define system architecture.
- Define agent taxonomy and boundaries.
- Define shared data contracts.
- Define memory and knowledge architecture.
- Define orchestration and workflow model.
- Establish an implementation roadmap.

## Completed

- GitHub repository established.
- `dev` branch created from `main`.
- Persistent project-state document created.

## Not yet implemented

- Agent runtime
- Claude Skills
- MCP tools
- Backend
- Frontend
- Database schema/migrations
- RAG pipeline
- Automated evaluation
- External integrations

## Branch policy

- `main`: stable/releasable work only.
- `dev`: active implementation and integration.
- Feature branches may be created from `dev` for risky or isolated changes.

## Continuity protocol

At the end of a major work session, update this file with:

- Current phase
- Completed work
- Active work
- Decisions made
- Open questions
- Known issues
- Next recommended action

This file is the persistent project handoff for future development sessions.
