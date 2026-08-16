# ATLAS AI — Agent Contract Specification

**Version:** 1.0.0  
**Status:** Foundation  
**Branch:** `dev`

## 1. Purpose

This document defines the common contract every ATLAS agent must follow. Agents are modular specialists. They do not communicate through informal prose alone; they exchange versioned, validated data.

## 2. Agent Identity

Every agent has a stable identifier and semantic version.

Example:

```json
{
  "agent_id": "product-research",
  "version": "1.0.0",
  "domain": "research"
}
```

Agent IDs use lowercase kebab-case.

## 3. Required Agent Metadata

Every agent definition must declare:

- `agent_id`
- `name`
- `version`
- `domain`
- `purpose`
- `responsibilities`
- `non_responsibilities`
- `required_inputs`
- `optional_inputs`
- `allowed_tools`
- `output_schema`
- `risk_level`
- `evaluation_suite`

## 4. Responsibilities Boundary

An agent must perform only the work required by its declared responsibility.

For example, Product Research may identify product benefits and objections. It must not silently decide the final advertising angle when the Positioning or Creative Strategy agent owns that decision.

This separation prevents agent drift and makes failures diagnosable.

## 5. Standard Execution Envelope

Conceptual request:

```json
{
  "execution": {
    "run_id": "uuid",
    "workflow_run_id": "uuid",
    "agent_id": "product-research",
    "agent_version": "1.0.0",
    "attempt": 1,
    "requested_at": "ISO-8601"
  },
  "context": {
    "organization_id": "uuid",
    "project_id": "uuid",
    "brand_id": "uuid",
    "campaign_id": "uuid"
  },
  "task": {
    "objective": "Analyze the product for creative strategy.",
    "constraints": [],
    "instructions": []
  },
  "inputs": {},
  "knowledge": [],
  "memory": [],
  "tools": []
}
```

## 6. Standard Output Envelope

```json
{
  "execution": {
    "run_id": "uuid",
    "agent_id": "product-research",
    "agent_version": "1.0.0",
    "status": "completed"
  },
  "result": {},
  "evidence": [],
  "warnings": [],
  "confidence": {
    "score": 0.0,
    "basis": ""
  },
  "next_steps": []
}
```

`confidence` is advisory metadata, not proof of correctness.

## 7. Status Values

Allowed execution statuses:

- `queued`
- `running`
- `completed`
- `needs_review`
- `blocked`
- `failed`
- `cancelled`

## 8. Evidence Contract

When an agent relies on external or retrieved information, it should preserve evidence metadata.

```json
{
  "evidence_id": "uuid",
  "source_type": "url|document|user_input|database|tool",
  "source_ref": "source identifier",
  "claim": "Short claim supported by the evidence.",
  "retrieved_at": "ISO-8601"
}
```

Agents must not fabricate citations.

## 9. Tool Permissions

Tools are explicitly granted by the orchestrator.

Example:

```json
{
  "tool": "web_search",
  "permission": "read"
}
```

An agent must not assume access to tools that were not provided.

## 10. Risk Levels

### Low

Content generation and internal analysis with no external side effect.

### Medium

Actions that can materially influence business decisions but do not directly affect external systems.

### High

External side effects, publishing, financial actions, credential changes, or irreversible operations.

High-risk actions require human approval in the initial system.

## 11. Validation Requirements

Before accepting an agent result, the runtime must validate:

1. JSON/schema correctness.
2. Required fields.
3. Enum values.
4. Organization/project access.
5. Output size limits.
6. Tool permission compliance.

Semantic evaluation happens separately from structural validation.

## 12. Error Contract

Errors must be structured.

```json
{
  "error": {
    "code": "AGENT_OUTPUT_INVALID",
    "message": "Output failed schema validation.",
    "retryable": false,
    "details": {}
  }
}
```

Suggested error categories:

- `INVALID_INPUT`
- `MISSING_CONTEXT`
- `TOOL_UNAVAILABLE`
- `TOOL_FAILURE`
- `MODEL_FAILURE`
- `OUTPUT_INVALID`
- `POLICY_BLOCKED`
- `TIMEOUT`
- `RATE_LIMITED`
- `AUTHORIZATION_FAILED`
- `UNKNOWN`

## 13. Retry Policy

Retries are controlled by the workflow engine, not by the model itself.

Default principles:

- Retry transient provider/network errors.
- Do not blindly retry invalid business logic.
- Do not retry authorization failures without a state change.
- Use bounded retries.
- Preserve every attempt in execution history.

## 14. Agent Context Rules

Agents receive only the context necessary to perform their task.

The orchestrator should prefer:

- Relevant memory retrieval.
- Relevant knowledge retrieval.
- Explicit user inputs.
- Previous workflow outputs.

Avoid injecting the entire project history into every prompt.

## 15. Human Review Contract

An agent may return:

```json
{
  "review": {
    "required": true,
    "reason": "Conflicting evidence requires human decision.",
    "questions": ["Which positioning direction should be approved?"]
  }
}
```

The workflow pauses until the review is resolved.

## 16. Versioning

Agent contracts use semantic versioning:

- MAJOR — incompatible input/output or behavior contract.
- MINOR — backward-compatible capability.
- PATCH — bugfix or wording correction with no contract change.

An agent output must record its version.

## 17. Agent Quality Criteria

Every production agent should be evaluated on:

- Task completion.
- Accuracy.
- Relevance.
- Consistency.
- Evidence discipline.
- Brand alignment.
- Schema compliance.
- Safety.
- Latency/cost where relevant.

## 18. Initial Agent Registry

The initial registry is divided into these domains:

### Executive

- `orchestrator`
- `project-manager`
- `qa-validator`
- `memory-manager`

### Research

- `market-research`
- `customer-research`
- `product-research`
- `competitor-intelligence`
- `review-mining`
- `trend-research`

### Strategy

- `positioning`
- `offer-strategy`
- `creative-strategy`
- `messaging`
- `angle-generator`

### Copy

- `hook-generator`
- `script-writer`
- `headline-generator`
- `cta-optimizer`
- `storytelling`

### Creative

- `creative-director`
- `shot-planner`
- `ugc-director`
- `thumbnail-strategist`
- `creative-auditor`

### Conversion

- `landing-page-strategist`
- `funnel-optimizer`
- `cro-auditor`

### Analytics

- `performance-analyst`
- `creative-testing-planner`
- `scaling-advisor`

## 19. First Vertical Slice Agents

The first implementation should use only:

1. `product-research`
2. `creative-strategy`
3. `hook-generator`
4. `script-writer`
5. `qa-validator`
6. `orchestrator`

This creates a manageable end-to-end proof of the architecture.

## 20. Agent Definition Template

Every agent implementation document should follow this template:

```text
# Agent Name

## Identity
## Mission
## Responsibilities
## Non-Responsibilities
## Inputs
## Outputs
## Tools
## Knowledge Requirements
## Memory Requirements
## Workflow Behavior
## Failure Modes
## Validation Rules
## Evaluation Criteria
## Examples
## Version History
```

## 21. Critical Rule

**The orchestrator owns coordination. Specialist agents own expertise. The runtime owns execution. The database owns persistence. The model provider owns inference.**

No component should silently absorb another component's responsibility.

---

**Next:** Database Schema Specification.
