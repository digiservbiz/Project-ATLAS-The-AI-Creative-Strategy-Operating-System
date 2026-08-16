# ATLAS AI — Technical Architecture

**Version:** 1.0.0  
**Status:** Foundation  
**Branch:** `dev`

## 1. Purpose

This document defines the technical architecture for ATLAS, the AI Creative Strategy Operating System. It converts the product vision into implementable technical boundaries without prematurely locking the system to a single AI vendor or infrastructure provider.

## 2. Architectural Principles

1. **Modular agents:** each agent owns a bounded capability.
2. **Orchestrated workflows:** agents cooperate through explicit workflow states rather than uncontrolled agent-to-agent conversation.
3. **Structured contracts:** inter-agent communication uses versioned JSON schemas.
4. **Provider abstraction:** model providers are accessed through an internal model gateway.
5. **Evidence-first:** research claims should retain source/evidence metadata when available.
6. **Human control:** actions with external side effects require explicit approval unless a future policy explicitly permits automation.
7. **Observable execution:** every workflow and agent run must be traceable.
8. **Persistent project memory:** important decisions and campaign knowledge are stored outside the chat context.
9. **Secure by default:** secrets, customer data, and third-party credentials are isolated.
10. **Incremental delivery:** build and validate a thin vertical slice before expanding the agent library.

## 3. Logical Architecture

```text
                    ┌──────────────────────────────┐
                    │       ATLAS Web App           │
                    │ Dashboard / Projects / Review │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │        API / Auth Layer       │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │      Workflow Orchestrator    │
                    │ routing / state / approvals   │
                    └───────┬─────────┬────────────┘
                            │         │
             ┌──────────────┘         └──────────────┐
             ▼                                       ▼
   ┌──────────────────┐                    ┌──────────────────┐
   │ Specialist Agents │                    │  Model Gateway   │
   │ research/strategy │                    │ Claude/OpenAI/etc│
   │ creative/CRO/etc. │                    └────────┬─────────┘
   └─────────┬────────┘                             │
             │                                      ▼
             │                              ┌───────────────┐
             │                              │ Model Provider │
             │                              └───────────────┘
             │
      ┌──────┴──────────────┐
      ▼                     ▼
┌───────────────┐    ┌────────────────┐
│ Knowledge/RAG │    │ Project Memory │
│ vector/search │    │ SQL/event data │
└───────┬───────┘    └───────┬────────┘
        └──────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │ PostgreSQL +     │
          │ pgvector         │
          └──────────────────┘
```

## 4. Core Runtime Components

### 4.1 API Layer

Responsibilities:

- Authentication and authorization.
- Project and brand management.
- Workflow creation and control.
- Agent execution requests.
- Approval actions.
- Retrieval of run history and artifacts.
- Integration configuration.

The API must not contain business logic that belongs to agents or workflow definitions.

### 4.2 Workflow Orchestrator

The orchestrator is the control plane of ATLAS.

Responsibilities:

- Select the appropriate workflow.
- Validate workflow inputs.
- Determine eligible next steps.
- Invoke agents through the agent runtime.
- Persist state after each step.
- Handle retries and failures.
- Request human approval where required.
- Assemble final deliverables.

The orchestrator should not perform specialist creative work itself.

### 4.3 Agent Runtime

The runtime provides a common execution envelope for all agents.

Each execution receives:

- Agent identifier and version.
- Task identifier.
- Workflow context.
- Relevant brand/project memory.
- Relevant knowledge references.
- Explicit input payload.
- Tool permissions.
- Output schema.

Each execution produces:

- Structured output.
- Evidence references where applicable.
- Confidence metadata where useful.
- Warnings.
- Usage/latency metadata.
- Execution status.

### 4.4 Model Gateway

All model calls should pass through a provider-neutral gateway.

Conceptual interface:

```text
ModelGateway.generate(request)
ModelGateway.stream(request)
ModelGateway.embed(request)
ModelGateway.countTokens(request)
```

The gateway allows ATLAS to use Claude as the primary model while retaining the ability to introduce other providers later.

### 4.5 Knowledge Service

Responsibilities:

- Ingest documents.
- Chunk and normalize content.
- Generate embeddings.
- Store metadata.
- Perform semantic and keyword retrieval.
- Apply project/brand access filters.
- Return evidence to agents.

### 4.6 Memory Service

Memory is separated from the general knowledge base.

Knowledge answers: **"What do we know?"**

Memory answers: **"What happened in this project?"**

Memory includes:

- Brand decisions.
- Campaign history.
- Winning/losing creatives.
- Approved messaging.
- User preferences.
- Previous research conclusions.
- Experiment results.
- Architecture decisions.

### 4.7 Integration Service

External services must be accessed through controlled adapters.

Examples:

- Shopify.
- Meta Ads.
- TikTok Ads.
- Google Analytics.
- Google Trends or equivalent research sources.
- Notion.
- Google Drive.

Credentials must never be placed inside agent prompts or stored in ordinary project memory.

## 5. Agent Taxonomy

Agents are grouped into domains:

### Executive

- CEO/Orchestrator
- Project Manager
- QA/Validation
- Memory Manager

### Research

- Market Research
- Customer Research
- Product Research
- Competitor Intelligence
- Review Mining
- Trend Research

### Strategy

- Positioning
- Offer Strategy
- Creative Strategy
- Messaging
- Angle Generation

### Copy

- Hook Generation
- Script Writing
- Headlines
- CTA
- Storytelling

### Creative

- Creative Direction
- Shot Planning
- UGC Direction
- Thumbnail Strategy
- Creative Audit

### Conversion

- Landing Page
- Funnel
- CRO

### Analytics

- Performance Analysis
- Testing Planning
- Scaling Recommendations

## 6. Agent Isolation

Every agent must declare:

- `agent_id`
- `version`
- `domain`
- `capabilities`
- `required_inputs`
- `optional_inputs`
- `allowed_tools`
- `output_schema`
- `risk_level`

Agents may not silently call capabilities outside their declared permissions.

## 7. Workflow Model

A workflow is a directed graph of typed steps.

```text
Workflow
  ├── input schema
  ├── context
  ├── steps[]
  │     ├── agent_id
  │     ├── input mapping
  │     ├── output schema
  │     ├── retry policy
  │     ├── approval policy
  │     └── transition rules
  └── completion policy
```

Example campaign workflow:

```text
Intake
  ↓
Market Research
  ↓
Customer Research
  ↓
Product Research
  ↓
Competitor Intelligence
  ↓
Positioning
  ↓
Offer Strategy
  ↓
Angle Generation
  ↓
Hook Generation
  ↓
Script Generation
  ↓
Creative Direction
  ↓
Landing Page Message Match
  ↓
Testing Plan
  ↓
Human Review
  ↓
Final Campaign Package
```

## 8. State Management

Every workflow execution must have durable state.

Minimum state fields:

- `workflow_run_id`
- `workflow_id`
- `project_id`
- `brand_id`
- `status`
- `current_step`
- `context_version`
- `created_at`
- `updated_at`
- `error_state`

Agent outputs should be stored as immutable execution artifacts. If an output is revised, create a new artifact version instead of silently replacing history.

## 9. Data Architecture

Primary relational store: **PostgreSQL**.

Vector retrieval: **pgvector** initially, with the architecture allowing a dedicated vector database later if scale requires it.

Cache/queues: **Redis** where required.

Object storage: S3-compatible storage for large files and creative assets.

The initial implementation should avoid unnecessary infrastructure until a measured need exists.

## 10. Multi-Tenant Security Model

The data model must support:

```text
Organization
  ├── Users
  ├── Projects
  ├── Brands
  ├── Campaigns
  ├── Knowledge
  └── Integrations
```

Every tenant-owned record must carry an organization boundary or inherit one through a validated relationship.

Authorization must be checked server-side.

## 11. Human Approval Model

High-impact actions must be gated.

Examples:

- Publishing an advertisement.
- Changing an advertising budget.
- Sending external communications.
- Modifying production integrations.
- Deleting important project data.

The initial version should generate recommendations and require a human to execute external side effects.

## 12. Observability

Every important operation must emit structured logs.

Minimum telemetry:

- Request ID.
- Workflow run ID.
- Agent run ID.
- User/organization ID where appropriate.
- Model provider.
- Model identifier.
- Latency.
- Token usage when available.
- Status.
- Error category.

Logs must not contain secrets or unnecessary sensitive user content.

## 13. Reliability

Agent execution should support:

- Timeouts.
- Bounded retries.
- Exponential backoff where appropriate.
- Idempotency keys.
- Partial workflow recovery.
- Explicit failure states.
- Human escalation.

A failed specialist should not corrupt the entire workflow state.

## 14. Evaluation Architecture

ATLAS requires an evaluation layer because qualitative AI output cannot be validated solely by unit tests.

Evaluations should cover:

- Schema validity.
- Instruction adherence.
- Evidence usage.
- Brand consistency.
- Marketing quality.
- Safety/policy compliance.
- Hallucination rate.
- Regression against approved examples.

Every major agent should have a curated evaluation set before being considered production-ready.

## 15. Security Boundaries

Secrets belong in a secret manager/environment configuration.

Never place the following in prompts, logs, or Git:

- API keys.
- OAuth refresh tokens.
- Passwords.
- Private customer information.
- Payment information.

External tool access should use least privilege.

## 16. Initial Implementation Strategy

Do not implement all agents simultaneously.

The first vertical slice should demonstrate:

```text
Project Intake
      ↓
Product Research
      ↓
Creative Strategy
      ↓
Hook Generation
      ↓
Script Generation
      ↓
QA Validation
      ↓
Campaign Package
```

This proves the orchestration architecture before the system expands.

## 17. Technology Decision Status

These are architectural defaults, not irreversible commitments:

| Area | Initial choice |
|---|---|
| Frontend | Next.js + TypeScript |
| Backend | Node.js + TypeScript |
| API | REST initially |
| Database | PostgreSQL |
| Vector search | pgvector |
| Cache/queue | Redis when needed |
| Primary model | Claude |
| Model abstraction | Internal Model Gateway |
| Object storage | S3-compatible |
| Deployment | Cloud provider selected during implementation |
| Authentication | Managed auth provider or secure application auth |

## 18. Non-Goals for the Foundation Phase

The foundation phase will not attempt to:

- Build every specialist agent.
- Automatically spend advertising budget.
- Automatically publish campaigns.
- Build a complex autonomous swarm.
- Add every external integration.
- Optimize infrastructure prematurely.

The priority is a reliable, observable, testable core.

## 19. Architectural Decision Rule

When a proposed feature increases complexity, the team must first ask:

1. Is the capability required for the current workflow?
2. Can it be implemented with an existing service?
3. Can it remain behind an interface?
4. Does it improve measurable product value?
5. Can it be tested independently?

If the answer is no, defer the feature.

## 20. Definition of Technical Readiness

The architecture is considered ready for the first implementation sprint when:

- Core entities are defined.
- Agent contracts are versioned.
- Workflow state is defined.
- Model access is abstracted.
- Memory and knowledge boundaries are defined.
- Authentication/authorization boundaries are defined.
- Logging requirements are defined.
- Failure and approval states are defined.
- The first vertical-slice workflow is specified.

---

**Next architectural documents:**

1. Agent Contract Specification
2. Database Schema Specification
3. Memory System Specification
4. Knowledge/RAG Specification
5. Workflow Engine Specification
6. First Vertical-Slice Implementation Plan
