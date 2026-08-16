# ATLAS AI — Claude Implementation Guide

**Version:** 1.0.0  
**Branch:** `dev`

## Purpose

This guide is the implementation contract for Claude Code and future contributors. It prevents the project from degenerating into a collection of disconnected prompts.

## Build Rules

1. Read the relevant architecture document before changing implementation.
2. Do not invent new architectural layers when an existing interface is sufficient.
3. Keep provider-specific code behind the Model Gateway.
4. Keep agent logic behind agent contracts.
5. Keep workflow coordination inside the Workflow Engine/Orchestrator.
6. Validate every external input.
7. Never commit secrets.
8. Add tests with meaningful behavior, not only coverage numbers.
9. Preserve execution history.
10. Prefer small, reversible changes.

## Implementation Order

### A. Repository

Create the application workspace with clear package boundaries.

Suggested structure:

```text
apps/
  web/
  api/
packages/
  agent-runtime/
  workflow-engine/
  model-gateway/
  memory/
  knowledge/
  database/
  schemas/
  shared/
agents/
docs/
tests/
infrastructure/
```

The exact structure may be adapted if the chosen tooling makes a better equivalent, but responsibilities must remain separated.

### B. Shared Types

Implement common types first:

- IDs
- execution envelopes
- agent metadata
- workflow state
- artifact references
- evidence
- errors
- approval states

Use runtime schema validation in addition to TypeScript types.

### C. Database

Implement migrations for the MVP tables defined in `05-DATABASE-SCHEMA-SPECIFICATION.md`.

Provide:

- local database startup
- migration command
- seed command
- reset command for development

### D. Model Gateway

Implement an interface that allows agents to request inference without knowing provider SDK details.

The first provider can be Claude.

Provider implementation must handle:

- model selection
- system instructions
- user/task input
- structured output requirements
- timeouts
- errors
- usage metadata

### E. Agent Runtime

Implement:

```text
registerAgent()
validateAgentInput()
executeAgent()
validateAgentOutput()
recordAgentRun()
```

The runtime must produce the execution records defined in the database specification.

### F. Workflow Engine

Implement:

```text
createRun()
startRun()
executeNextStep()
persistStep()
requestApproval()
resumeRun()
retryStep()
completeRun()
failRun()
```

Workflow definitions must be data-driven rather than hard-coded to one campaign.

### G. First Agents

Implement in this order:

1. Product Research
2. Creative Strategy
3. Angle Generator
4. Hook Generator
5. Script Writer
6. QA Validator

Each agent must have:

- identity
- system prompt
- input schema
- output schema
- runtime registration
- unit/evaluation fixtures

### H. First Workflow

Create the first workflow definition from `11-FIRST-VERTICAL-SLICE.md`.

The orchestrator should execute the workflow from the API without special-case logic for individual agents.

## Prompt Engineering Rules

Prompts should be version-controlled.

A prompt must specify:

- Role
- Mission
- Context usage
- Decision rules
- Constraints
- Required output
- Failure behavior

Do not put application state into static prompts. Inject state through structured context.

## Knowledge and Memory Rules

Agents should receive retrieved context with provenance.

Never treat an unverified model-generated statement as a factual source merely because it exists in memory.

Memory writes should be explicit and classified.

## Testing Rules

Every agent needs at least:

- Happy-path test
- Missing-input test
- Constraint test
- Invalid-output test
- Regression example

The workflow needs:

- successful execution
- agent failure/retry
- QA rejection
- approval pause/resume
- final artifact persistence

## Security Rules

Never:

- log API keys
- put credentials in prompts
- commit `.env` files containing secrets
- trust tenant IDs supplied by clients
- allow agents unrestricted tool access

## Definition of Done for a Component

A component is not complete when its code compiles.

It is complete when:

- Contract documented
- Implementation exists
- Unit tests exist
- Integration behavior is tested where applicable
- Errors are handled
- Observability exists
- Security boundaries are respected
- Documentation is updated
- `PROJECT-STATE.md` is updated when the architectural state changes

## What Claude Must Not Do

Claude Code must not:

- Rewrite the entire repository to simplify one task.
- Remove architecture documents because they appear unused.
- Add autonomous external actions without an approval policy.
- Hard-code all agents into one giant prompt.
- Store secrets in source control.
- Replace structured contracts with free-form text where a schema is appropriate.
- Claim a feature is complete without tests.

## Decision Priority

When requirements conflict, prioritize:

1. Security
2. Data integrity
3. Correctness
4. Testability
5. Maintainability
6. Performance
7. Cost optimization
8. Convenience

## Current Implementation Target

Build the smallest complete system capable of executing the first vertical slice in `11-FIRST-VERTICAL-SLICE.md`.

Do not implement the full agent catalog before this target works.
