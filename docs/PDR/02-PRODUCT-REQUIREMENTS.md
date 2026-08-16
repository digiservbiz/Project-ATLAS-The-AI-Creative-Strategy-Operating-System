# 02 — Product Requirements

## 1. Functional requirements

### FR-001 Workspace isolation
The system MUST isolate organizations, projects, brands, campaigns, artifacts and memories by tenant context. A request must never retrieve another organization's private data.

### FR-002 Project context
A project MUST have reusable brand, product, audience, market and campaign context that agents can consume without copying the same context into every prompt.

### FR-003 Campaign brief
Users MUST be able to create a campaign brief containing objective, product, market, channel, audience, offer, constraints, desired outcome and known evidence.

### FR-004 Research
ATLAS MUST support structured research tasks and distinguish sourced evidence, user-provided facts, model inference and unresolved questions.

### FR-005 Strategy
ATLAS MUST produce a creative strategy that identifies the primary problem, audience motivation, promise, proof requirements, objections, offer continuity and testing hypotheses.

### FR-006 Angle matrix
ATLAS MUST generate materially differentiated creative angles and classify them by buyer motivation. Duplicate rewordings SHOULD be detected and reduced.

### FR-007 Hooks
ATLAS MUST generate multiple hook hypotheses mapped to angles and evidence. Hooks MUST NOT introduce unsupported claims.

### FR-008 Scripts
ATLAS MUST transform selected hooks/angles into structured creative concepts and scripts appropriate to the selected channel and format.

### FR-009 QA
ATLAS MUST evaluate outputs for strategic continuity, evidence support, prohibited/unsupported claims, clarity, audience fit, offer alignment and required production inputs.

### FR-010 Artifacts
Important outputs MUST be persisted as versioned artifacts with authoring agent, workflow run, timestamps, and provenance metadata.

### FR-011 Approval
Users MUST be able to approve, reject, request changes, or block consequential outputs before external side effects.

### FR-012 Memory
The system MUST be able to store useful validated learnings at organization, project, brand, product, audience, campaign and creative levels with provenance and confidence.

### FR-013 Evaluation
ATLAS MUST support repeatable evaluation cases for agent quality and workflow regressions.

### FR-014 Observability
Every workflow and agent execution MUST expose enough metadata to diagnose failures, latency, cost, tool usage and output provenance.

## 2. Non-functional requirements

### NFR-001 Security
Secrets MUST never be embedded in prompts, committed to the repository, or returned unnecessarily to agents.

### NFR-002 Reliability
A failed agent step MUST be recoverable without corrupting prior completed artifacts.

### NFR-003 Idempotency
Retries MUST avoid duplicate irreversible side effects and SHOULD reuse deterministic run identifiers where appropriate.

### NFR-004 Auditability
Important decisions and external actions MUST be traceable to a user, workflow, agent version, tool call and artifact version.

### NFR-005 Extensibility
New agents, skills, models and tools MUST be addable without rewriting the core orchestrator.

### NFR-006 Provider independence
Business logic MUST NOT depend directly on a single model vendor SDK.

### NFR-007 Cost awareness
The platform SHOULD track token/model/tool costs and support configurable limits.

### NFR-008 Human control
High-impact or external side effects MUST have explicit authorization and approval controls.

## 3. Core acceptance criteria

A v1 vertical slice is successful when a user can submit one product brief and receive a traceable campaign strategy package containing research assumptions, a creative strategy, at least 20 differentiated angle hypotheses, hooks, scripts, QA findings, and an evaluation score, with every stage recorded in a workflow run.
