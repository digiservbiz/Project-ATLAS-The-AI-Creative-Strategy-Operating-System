# ATLAS System Architecture

**Status:** Living specification
**Version:** 1.0
**Branch:** `dev`
**Parent specification:** `docs/PDR/00-MASTER-INDEX.md`

## 1. Purpose

This document defines the system boundaries, major runtime components, data flow, and architectural invariants for ATLAS — the AI Creative Strategy Operating System for e-commerce brands and agencies.

ATLAS is designed as a modular, research-first, multi-agent system. It coordinates specialist reasoning, structured artifacts, semantic intelligence, persistent memory, evaluation, human approval, and campaign learning.

The architecture must support incremental implementation. A documented component is not considered implemented until it has corresponding contracts, code, tests, and operational behavior.

## 2. Architectural goals

ATLAS must:

- transform business and campaign briefs into evidence-aware creative strategy;
- separate orchestration from specialist reasoning;
- preserve structured artifacts and provenance across workflows;
- retrieve knowledge by meaning as well as metadata and exact identifiers;
- maintain durable organizational, brand, customer, creative, and campaign memory;
- learn from campaign outcomes without confusing correlation with causation;
- support human approval at critical decision boundaries;
- provide deterministic interfaces around otherwise probabilistic model calls;
- make model providers replaceable through the model gateway;
- make tools permissioned and auditable;
- support evaluation, regression testing, observability, and cost controls;
- evolve from a strategy-generation system into a recommendation and learning system.

## 3. High-level architecture

```text
                              ATLAS
                                |
                         +------+------+
                         | Orchestrator |
                         +------+------+
                                |
             +------------------+------------------+
             |                  |                  |
             v                  v                  v
       +-----------+      +-----------+      +-----------+
       | Research  |      | Strategy  |      | Creative  |
       | Agents    |      | Agents    |      | Agents    |
       +-----+-----+      +-----+-----+      +-----+-----+
             |                  |                  |
             +------------------+------------------+
                                |
                                v
                  +-----------------------------+
                  | Semantic Intelligence Layer |
                  | embeddings / vector search  |
                  | similarity / clustering     |
                  | context linking / ranking   |
                  +-------------+---------------+
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
      +-------------+                       +-------------+
      | Knowledge / |                       | ATLAS Memory|
      | RAG         |                       |             |
      +------+------+                       +------+------+ 
             |                                     |
             +------------------+------------------+
                                |
                                v
                       +-----------------+
                       | Workflow /      |
                       | Artifact Store  |
                       +--------+--------+
                                |
                                v
                       +-----------------+
                       | Human Approval  |
                       +--------+--------+
                                |
                                v
                       +-----------------+
                       | Execution /     |
                       | Integrations    |
                       +--------+--------+
                                |
                                v
                       +-----------------+
                       | Performance     |
                       | Signals         |
                       +--------+--------+
                                |
                                v
                       +-----------------+
                       | Evaluation +    |
                       | Learning Loop   |
                       +--------+--------+
                                |
                                +---------> Memory / Knowledge
```

## 4. Core components

### 4.1 Orchestrator

The Orchestrator owns workflow planning and coordination. It selects the required agents, manages dependencies, tracks workflow state, validates artifact contracts, handles retries and failures, and enforces approval boundaries.

The Orchestrator must not become a monolithic creative agent. Strategic reasoning remains delegated to specialist agents.

### 4.2 Specialist agent runtime

Agents are versioned, contract-driven specialists. Each agent receives a structured input, performs a bounded task using permitted models/tools, and returns a typed artifact or typed failure.

Initial specialists include:

1. `product-research@1.0.0`
2. `creative-strategy@1.0.0`
3. `angle-generator@1.0.0`
4. `hook-generator@1.0.0`
5. `script-writer@1.0.0`
6. `qa-validator@1.0.0`

Additional specialists are added through the agent catalog rather than by expanding the Orchestrator's responsibilities.

### 4.3 Semantic Intelligence Layer

Semantic Intelligence is a first-class ATLAS subsystem.

Its purpose is to represent and retrieve business knowledge by semantic meaning and context rather than relying only on exact keyword matches.

The layer may operate on representations of:

- products and product attributes;
- customer problems and needs;
- customer/avatar descriptions;
- market and competitor observations;
- creative angles;
- hooks, scripts, ads, and content;
- landing-page messages and sections;
- offers and claims;
- comments, objections, reviews, and questions;
- campaign outcomes and experiment summaries;
- reusable strategic patterns and lessons.

The layer contains, conceptually:

- embedding generation;
- embedding-model abstraction;
- vector storage and similarity search;
- semantic candidate retrieval;
- metadata filtering;
- similarity scoring;
- clustering where useful;
- relationship linking between artifacts;
- semantic re-ranking inputs for recommendation workflows.

ATLAS must not treat an embedding as ground truth. Semantic similarity is a retrieval and reasoning aid. Business rules, evidence, performance data, recency, permissions, and evaluation remain authoritative where applicable.

### 4.4 Knowledge / RAG

Knowledge/RAG manages external and internal reference material that informs strategy. It handles ingestion, chunking or document segmentation, metadata, provenance, retrieval, freshness, and evidence references.

Semantic retrieval may use the Semantic Intelligence Layer, while knowledge ownership and provenance remain within the Knowledge/RAG boundary.

### 4.5 ATLAS Memory

Memory stores durable lessons and context across workflows and campaigns.

Memory should distinguish at minimum:

- organization memory;
- brand memory;
- product memory;
- customer/context memory;
- creative memory;
- campaign memory;
- experiment memory;
- learned patterns and rejected hypotheses.

Memory retrieval can combine exact metadata, structured filters, semantic similarity, recency, confidence, and performance evidence.

### 4.6 Workflow and artifact persistence

The workflow layer persists execution state and artifact lineage. Every major artifact should be attributable to a workflow, agent/version, model configuration, input context, and relevant evidence where applicable.

Durable persistence is required for recovery, auditability, replay, evaluation, and learning.

### 4.7 Model Gateway

The Model Gateway abstracts model providers and model-specific invocation details from agents.

It must support:

- provider/model selection;
- structured outputs;
- model capability metadata;
- retries and timeout policy;
- token/cost accounting;
- request tracing;
- fallback policy where explicitly configured.

Embedding models must be accessed through an abstraction rather than being hard-coded into individual agents.

### 4.8 Tools and MCP

Tools are capability boundaries, not arbitrary extensions of agent prompts. Tool access must be permissioned, validated, observable, and auditable.

External actions that can materially affect a campaign, customer, account, or production system must respect approval and governance policies.

### 4.9 Execution and integrations

Execution connects approved ATLAS artifacts to external systems such as advertising, commerce, analytics, content, and research platforms.

Execution is downstream from strategy and approval. A generated artifact must not be assumed to have been published merely because it exists in ATLAS.

### 4.10 Evaluation and learning

Evaluation measures artifact quality, strategic coherence, evidence discipline, workflow correctness, and where available, downstream business outcomes.

The learning loop converts validated observations into reusable memory and improved future recommendations. Raw performance metrics must not automatically become strategic truth without appropriate context and attribution safeguards.

## 5. Canonical data flow

The primary creative-strategy loop is:

```text
Brief
  -> Context & Research
  -> Customer / Problem Model
  -> Creative Strategy
  -> Angle Matrix
  -> Hook Concepts
  -> Creative Scripts
  -> QA / Evidence / Risk Checks
  -> Campaign Package
  -> Human Approval
  -> Launch / Test
  -> Performance Data
  -> Evaluation
  -> Learning / Memory
  -> Next Strategy Iteration
```

The semantic intelligence path cuts across this loop:

```text
Artifact / Observation
  -> Normalize
  -> Embed
  -> Store representation + metadata + provenance
  -> Retrieve semantically and/or structurally
  -> Rank candidates
  -> Supply context to agent/workflow
  -> Record resulting decision and outcome
```

## 6. Recommendation architecture

A future mature ATLAS recommendation flow should follow a staged architecture:

```text
Current context
   |
   v
Candidate generation
   |
   |-- semantic similarity
   |-- metadata filters
   |-- historical patterns
   |-- explicit business constraints
   v
Candidate scoring
   |
   |-- relevance
   |-- evidence strength
   |-- historical performance
   |-- recency
   |-- brand fit
   |-- campaign objective
   v
Strategic re-ranking
   |
   |-- diversity of hypotheses
   |-- risk / policy constraints
   |-- novelty
   |-- confidence
   v
Recommendation / next action
```

This architecture prevents ATLAS from simply copying the most similar historical creative. Similarity is used to find candidates; strategic reasoning determines what should actually be recommended.

## 7. Creative-context model

ATLAS should represent creative work as a connected context rather than isolated text fields.

```text
Product
  -> Customer
  -> Problem / Need
  -> Context of use
  -> Buyer motivation
  -> Angle
  -> Hook
  -> Creative concept
  -> Message / Offer
  -> Landing-page promise
  -> Intended behavior
  -> Observed behavior
  -> Conversion outcome
```

This model supports the strategic principle of message continuity. A high-click creative followed by a mismatched landing page must be diagnosable as a funnel-level problem rather than automatically labeled a creative winner.

## 8. Performance learning model

ATLAS should capture both quantitative and qualitative signals, including where available:

- impressions;
- reach;
- clicks;
- CTR;
- CPC;
- landing-page views;
- lead events;
- purchases;
- conversion rate;
- revenue;
- ROAS;
- comments;
- objections;
- questions;
- qualitative feedback;
- experiment metadata.

Performance observations must retain their context: product, market, campaign objective, audience configuration, creative version, offer, landing-page version, spend/exposure, timeframe, and attribution assumptions where available.

## 9. Architectural invariants

1. **Typed boundaries:** agents exchange structured contracts, not undocumented free-form assumptions.
2. **Provenance:** important outputs must retain source/evidence lineage where applicable.
3. **Versioning:** agents, skills, workflows, and important schemas are versioned.
4. **No silent memory mutation:** durable strategic memory must have an explicit write path and provenance.
5. **Semantic similarity is not truth:** embeddings never override authoritative business constraints or evidence.
6. **No automatic causal claims:** performance data does not prove why an outcome occurred without sufficient experimental context.
7. **Human approval:** critical external actions remain gated by configured approval policy.
8. **Provider independence:** agents do not directly depend on a specific model vendor implementation.
9. **Observability:** model calls, tool calls, workflow transitions, and material decisions must be traceable.
10. **Failure isolation:** one agent or provider failure must not corrupt unrelated durable state.
11. **Replayability:** important workflows should be reproducible from persisted inputs, versions, and configuration where technically feasible.
12. **Security by boundary:** tenant, brand, campaign, and user permissions must be enforced before retrieval or action.

## 10. Failure modes

### Semantic retrieval failure

**Cause:** weak embedding, poor normalization, stale representation, or irrelevant similarity.

**Response:** fall back to structured retrieval, metadata filters, alternate queries, or explicit agent reasoning. Record retrieval quality where measurable.

### Context contamination

**Cause:** retrieving knowledge from the wrong brand, campaign, market, or tenant.

**Response:** enforce authorization and metadata filtering before semantic ranking. Never rely on vector similarity alone for isolation.

### Historical winner copying

**Cause:** recommendation system overweights semantic similarity or historical performance.

**Response:** enforce hypothesis diversity, novelty controls, and strategic re-ranking.

### Performance overinterpretation

**Cause:** treating a metric as proof of causality.

**Response:** preserve experiment context and label observations according to evidence strength.

### Model/provider failure

**Cause:** timeout, rate limit, malformed response, or unavailable provider.

**Response:** bounded retry/fallback policy through the Model Gateway and durable workflow state.

### Memory pollution

**Cause:** low-quality or unverified observations being promoted to durable strategic memory.

**Response:** require memory write contracts, confidence/evidence metadata, and evaluation or approval rules appropriate to the memory type.

## 11. Security and governance boundaries

Semantic retrieval must enforce authorization before returning candidates. Vector databases are not an authorization layer.

Sensitive or tenant-specific information must not become discoverable across unauthorized brands, organizations, or campaigns through semantic similarity.

External execution must be separately permissioned from generation.

All material automated actions must have an auditable actor/workflow identity.

## 12. Evaluation requirements

The architecture should be evaluated at multiple levels:

### Component level

- embedding generation validity;
- retrieval precision/recall on curated datasets;
- metadata filtering correctness;
- schema validation;
- provider reliability.

### Agent level

- task correctness;
- evidence discipline;
- strategic relevance;
- contract compliance;
- hallucination/fabrication rate.

### Workflow level

- artifact continuity;
- correct dependency ordering;
- recovery behavior;
- approval enforcement;
- provenance completeness.

### Recommendation level

- relevance;
- diversity;
- novelty;
- evidence quality;
- downstream usefulness;
- learning quality over repeated iterations.

## 13. Implementation mapping

The architecture maps to the repository as follows:

- `packages/contracts` — shared typed interfaces and artifact contracts;
- `packages/agent-runtime` — agent lifecycle and execution boundary;
- `packages/model-gateway` — provider/model abstraction, including future embedding providers;
- `packages/workflow-engine` — durable workflow coordination;
- `packages/domain` — domain entities and business rules;
- `packages/persistence` — persistence interfaces and repository boundaries;
- `packages/database` — PostgreSQL schema/migrations and concrete storage foundations;
- `packages/agents` — specialist implementations;
- `packages/evaluation` — evaluation and regression foundations;
- `docs/PDR` — requirements and architecture source of truth.

The Semantic Intelligence implementation should eventually be isolated behind a dedicated contract/service boundary rather than embedded directly inside individual agents.

## 14. Implementation sequence

The architecture is intentionally implemented in stages:

1. Define semantic intelligence contracts and representation metadata.
2. Define embedding-provider abstraction in the Model Gateway.
3. Define vector persistence/retrieval interfaces.
4. Implement semantic retrieval against controlled test fixtures.
5. Connect semantic retrieval to memory and knowledge workflows.
6. Add semantic context to selected agents.
7. Add recommendation candidate generation and re-ranking.
8. Feed evaluated campaign outcomes into the learning loop.
9. Measure retrieval and recommendation quality continuously.

The first implementation milestone must not require a production embedding vendor. Interfaces and deterministic test fixtures should exist before live provider coupling.

## 15. Definition of done

This architecture section is considered implemented only when:

- every component boundary has a corresponding contract or implementation;
- semantic intelligence has an explicit service boundary;
- retrieval is authorization-aware;
- memory and knowledge retrieval preserve provenance;
- model providers are abstracted;
- workflow state is durable;
- critical actions are approval-gated;
- evaluation can measure component and end-to-end behavior;
- observability can trace material workflow decisions;
- the implementation roadmap maps requirements to concrete repository work.
