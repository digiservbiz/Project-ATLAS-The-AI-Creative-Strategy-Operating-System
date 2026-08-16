# ATLAS — System Architecture

**Status:** Foundation proposal

## 1. Architectural goal

ATLAS is a workflow-oriented multi-agent system. The architecture must make it possible to add, replace, test, and version specialist capabilities without rewriting the entire platform.

## 2. Logical layers

```text
┌─────────────────────────────────────────────────────┐
│ Experience Layer                                    │
│ Dashboard • Campaign Workspace • Reviews • Reports │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│ Orchestration Layer                                 │
│ Workflow Planner • Router • State • Approvals       │
│ Retries • Scheduling • Policy Enforcement            │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│ Agent Layer                                         │
│ Research • Strategy • Copy • Creative • CRO • QA   │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│ Intelligence Layer                                  │
│ Knowledge Retrieval • Brand Memory • Campaign      │
│ Memory • Evidence • Evaluation                      │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│ Tool / Integration Layer                            │
│ Web • Files • Commerce • Ads • Analytics • MCP     │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│ Data / Observability Layer                          │
│ PostgreSQL • Vector Search • Object Storage • Logs │
└─────────────────────────────────────────────────────┘
```

## 3. Orchestrator

The Orchestrator is responsible for:

- Understanding the user's requested outcome.
- Selecting an appropriate workflow.
- Determining required specialist capabilities.
- Passing only the necessary context to each agent.
- Validating outputs against contracts.
- Managing workflow state.
- Requesting human approval at policy-defined gates.
- Handling retries and recoverable failures.
- Recording provenance and execution metadata.

The Orchestrator should coordinate; it should not become a monolithic marketing expert.

## 4. Agent model

Every specialist agent should have:

- A stable identifier.
- A clearly bounded responsibility.
- Versioned instructions.
- Typed input and output contracts.
- Allowed tools.
- Knowledge sources it may retrieve.
- Validation rules.
- Evaluation criteria.
- Explicit failure states.

Agents communicate through structured artifacts rather than relying on unstructured conversation history.

## 5. Agent categories

### Research

Market Research, Customer Research, Product Research, Competitor Intelligence, Review Mining, Trend Research.

### Strategy

Positioning, Offer Strategy, Creative Strategy, Messaging, Angle Generation.

### Copy / Creative

Hook Generation, Headline, Script Writing, Storytelling, CTA, Creative Direction, Shot Planning, UGC, Thumbnail, Creative Audit.

### Conversion

Landing Page, Funnel, CRO.

### Analytics

Performance Analysis, Testing Planning, Scaling Recommendations.

### Platform services

Orchestrator, Project Manager, QA, Memory, Knowledge.

## 6. Context architecture

Each workflow run should distinguish:

- User request
- Brand context
- Product context
- Campaign context
- Retrieved evidence
- General knowledge
- Prior decisions
- Current artifacts
- Tool results
- Agent outputs
- Approval decisions

Do not inject the entire database or conversation into every agent. Context should be selected intentionally.

## 7. Evidence and provenance

Research-derived claims should retain provenance whenever possible. An evidence record should include source identity, retrieval time, relevant excerpt or normalized fact, source type, and confidence/quality metadata.

ATLAS must distinguish:

- observed evidence
- user-provided facts
- model-generated hypotheses
- assumptions
- recommendations

## 8. Workflow state

A workflow is a persistent state machine. At minimum it should support:

`draft → planning → running → waiting_for_approval → completed`

with failure/cancellation states such as:

`failed`, `cancelled`, `paused`.

Individual tasks should have their own lifecycle and execution metadata.

## 9. Human approval

Approval gates should exist before consequential actions and where strategic ambiguity is material. Approval decisions become campaign memory when relevant.

## 10. Knowledge vs memory

General knowledge is reusable across brands. Memory is contextual and belongs to a brand, campaign, experiment, or workflow unless explicitly promoted.

This separation prevents one brand's assumptions from contaminating another brand's strategy.

## 11. Model provider abstraction

The runtime should use an internal model interface so an agent can request capabilities without hard-coding the entire platform to one provider. Provider-specific adapters may implement Claude first and support additional providers later.

## 12. Minimal vertical slice

Before implementing the entire agent catalog, the first end-to-end slice should prove:

`Campaign brief → research synthesis → positioning → angle generation → hook generation → creative brief → QA → user approval → stored campaign artifacts`

This vertical slice is the architecture validation milestone.

## 13. Non-functional requirements

The system should be:

- Observable
- Auditable
- Versioned
- Testable
- Resilient to tool/model failures
- Secure by default
- Explicit about uncertainty
- Capable of deterministic validation around probabilistic model outputs

## 14. Architecture rule

Do not add infrastructure merely because it is common in AI systems. Every component must have a defined responsibility, owner, data contract, failure mode, and reason for existing.
