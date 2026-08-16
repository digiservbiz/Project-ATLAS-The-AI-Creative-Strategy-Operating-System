# ATLAS AI — Workflow Engine Specification

**Version:** 1.0.0  
**Status:** Foundation  
**Branch:** `dev`

## 1. Purpose

The Workflow Engine turns ATLAS capabilities into deterministic, observable business processes. It coordinates agents, state, tools, approvals, retries, and artifacts.

## 2. Core Rule

A workflow is a state machine, not an open-ended agent conversation.

Every transition must be explainable from:

- Current state.
- Step result.
- Workflow rules.
- Approval state.
- Error/retry policy.

## 3. Workflow Definition

Conceptual structure:

```json
{
  "workflow_id": "creative-campaign-v1",
  "version": "1.0.0",
  "input_schema": "CampaignInput",
  "steps": [
    {
      "id": "product_research",
      "agent": "product-research",
      "input_mapping": {},
      "output_schema": "ProductResearchOutput"
    }
  ]
}
```

## 4. Step Types

Initial step types:

- `agent`
- `approval`
- `condition`
- `transform`
- `parallel`
- `human_input`
- `end`

The MVP should implement `agent`, `approval`, `condition`, and `end` first.

## 5. State Machine

Workflow states:

- `created`
- `running`
- `waiting_for_input`
- `waiting_for_approval`
- `paused`
- `completed`
- `failed`
- `cancelled`

## 6. Execution Model

```text
Create Run
   ↓
Validate Input
   ↓
Load Context
   ↓
Resolve Next Step
   ↓
Prepare Agent Context
   ↓
Execute Agent
   ↓
Validate Output
   ↓
Persist Artifact
   ↓
Evaluate Transition
   ↓
Next Step / Approval / Completion
```

## 7. Context

Workflow context contains references and structured data required to execute the campaign.

Avoid storing unbounded conversation transcripts in the context object.

Context should reference durable artifacts where possible.

## 8. Input Mapping

A step may consume:

- Original workflow input.
- Previous artifact output.
- Selected memory.
- Selected knowledge.
- User-provided values.

Example:

```json
{
  "product_name": "$.artifacts.product_research.result.name",
  "audience": "$.brand.audience_summary"
}
```

The implementation should validate mappings before execution.

## 9. Conditions

Conditions should operate on structured outputs.

Example:

```text
IF research.status == "insufficient"
THEN human_input
ELSE creative_strategy
```

Conditions must not depend on fragile natural-language matching when a structured field can represent the decision.

## 10. Parallel Execution

Parallel execution may be used when steps are independent.

Example:

```text
                 ┌─ Customer Research ─┐
Product Research ┤                     ├─ Strategy
                 └─ Competitor Research┘
```

The engine must wait for all required branches before executing a dependent step.

## 11. Retries

Each step has a bounded retry policy.

Retryable examples:

- Temporary model failure.
- Network failure.
- Rate limit.
- Temporary external service failure.

Non-retryable examples:

- Invalid input.
- Authorization failure.
- Policy block.
- Invalid business state.

## 12. Idempotency

Every execution should have an idempotency strategy.

Replaying a workflow after a transient failure must not unintentionally create duplicate external side effects.

For the MVP, external side effects are human-approved and therefore limited.

## 13. Approvals

When a workflow reaches an approval step:

1. Persist current state.
2. Create approval record.
3. Notify the UI.
4. Pause execution.
5. Resume after a valid decision.

Approval decisions are immutable historical events.

## 14. Failure Recovery

If a workflow fails:

- Preserve the failed step.
- Preserve the error.
- Preserve all previous artifacts.
- Mark the run failed.
- Allow an authorized user to retry from a safe step.

The engine should not restart the entire workflow unnecessarily.

## 15. Artifact Passing

Agents should exchange durable artifact references rather than enormous prompt strings whenever possible.

Example:

```text
Product Research Artifact
       ↓
Creative Strategy reads artifact
       ↓
Strategy Artifact
       ↓
Hook Generator reads strategy artifact
```

## 16. First ATLAS Workflow

The initial production-shaped workflow is:

```text
Campaign Intake
      ↓
Product Research
      ↓
Customer Research
      ↓
Creative Strategy
      ↓
Angle Generation
      ↓
Hook Generation
      ↓
Script Writing
      ↓
QA Validation
      ↓
Human Approval
      ↓
Campaign Package
```

This workflow directly operationalizes the ATLAS philosophy of research → strategy → creative → validation.

## 17. Workflow Observability

Every transition should record:

- Run ID.
- Step ID.
- Previous state.
- New state.
- Actor/system component.
- Timestamp.
- Result reference.
- Error if applicable.

## 18. Workflow Security

A workflow must execute under the permissions of the requesting organization/user.

No workflow step may bypass authorization because it was invoked by another agent.

## 19. Workflow Versioning

A running workflow is pinned to the workflow definition version with which it started.

New workflow versions affect new runs only unless an explicit migration strategy exists.

## 20. MVP Implementation

Implement in this order:

1. Workflow definition parser.
2. Input validation.
3. Run persistence.
4. Agent step execution.
5. Output validation.
6. Artifact persistence.
7. Conditions.
8. Approval pause/resume.
9. Retry handling.
10. Run inspection API.

## 21. Acceptance Criteria

The workflow engine is ready for the first vertical slice when:

- A workflow can be defined as structured data.
- A run can be created and persisted.
- An agent step can execute.
- Output can be schema-validated.
- Output becomes an artifact.
- The next step can consume the artifact.
- Failed runs can resume safely.
- Approval steps pause and resume correctly.
- Full execution history is visible.

---

**Next:** API Specification.
