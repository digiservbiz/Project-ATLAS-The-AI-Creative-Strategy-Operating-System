# ATLAS Recommended Architecture Additions — Dev Branch Audit

**Branch audited:** `dev`
**Audit scope:** 20 recommended architecture additions
**Decision rule:** IMPLEMENTED / PARTIAL / SPECIFIED ONLY / MISSING

## Executive conclusion

ATLAS already contains substantial foundations for orchestration, research, strategy, creative production, SIEL, provenance, memory, analytics/learning, experimentation, campaign execution, persistence, OAuth and production operations. The recommendations should therefore be implemented as extensions, not as a redesign.

The largest architectural gap is a first-class, business-agnostic strategic model. Existing strategy paths are still product-oriented in places, while the recommended model needs Business/Brand/Product/Service/Offer/Audience/Market/Competitor/Channel/Campaign as normalized concepts and a persistent Strategic State consumed by the Orchestrator.

## Audit matrix

| # | Capability | Status | Existing evidence | Required action |
|---|---|---|---|---|
| 1 | Business-Agnostic Intelligence Layer | PARTIAL | `domain`, `product-intelligence`, strategy context and platform models exist; product-specific pipeline remains a major path | Add normalized Business Intelligence model; make Product a specialization |
| 2 | Strategic State / ATLAS Brain | PARTIAL | persistent campaign state, strategy context, memory, strategy decision engine exist | Add persistent cross-workflow Strategic State as strategic source of truth and orchestrator input |
| 3 | Evidence → Insight → Decision | PARTIAL | research evidence normalizer, evidence-aware context, strategy decision, provenance contracts exist | Formalize typed Observation/Insight/Hypothesis/Decision chain and provenance links |
| 4 | Audience Intelligence Engine | PARTIAL | research hub, semantic layer and strategy context provide audience context | Add persistent audience-segment intelligence schema and customer-language evidence model |
| 5 | Creative DNA System | PARTIAL | creative intelligence, semantic asset indexing, SIEL creative concepts exist | Add explicit Creative DNA schema and SIEL indexing fields |
| 6 | Creative Hypothesis Engine | PARTIAL | experiments, strategy decisions and creative pipeline exist | Add first-class hypothesis object linking evidence → variants → variables → outcomes → learning |
| 7 | Creative Experimentation Engine | IMPLEMENTED | `experiments/src/experiment-engine.ts`, optimizer, workflow and learning bridges exist | Extend causal-variable discipline and hypothesis linkage; do not create a second experiment engine |
| 8 | Learning Engine | IMPLEMENTED | `analytics/src/learning-engine.ts`, `learning/src/closed-loop-learning.ts`, cross-campaign patterns and memory bridges exist | Extend evidence/sample/scope/confidence model; avoid duplicate engine |
| 9 | Outcome-Weighted SIEL | PARTIAL | SIEL supports performance relevance and semantic retrieval; performance intelligence has semantic retrieval | Add explicit configurable outcome-weighted re-ranking with provenance and confidence |
| 10 | Angle Gap Detection | PARTIAL | SIEL PDR defines angle-gap detection as a use case/future expansion; no dedicated production module identified | Implement using Creative DNA + SIEL |
| 11 | Creative Fatigue Detection | SPECIFIED ONLY | SIEL PDR explicitly identifies fatigue as future expansion | Implement semantic similarity + performance decay + exposure + time |
| 12 | Hook → Offer → Landing → Checkout Continuity | PARTIAL | SIEL defines hook→landing continuity and creative QA foundations | Extend to full continuity chain and diagnostic attribution |
| 13 | Offer Intelligence | MISSING | No dedicated offer-intelligence module identified in audited tree | Build offer model + diagnosis engine |
| 14 | Marketing Funnel Intelligence | MISSING | Campaign/performance components exist, but no dedicated funnel-intelligence model identified | Build funnel stages, journey mapping and stage diagnosis |
| 15 | Competitive Change Detection | PARTIAL | `competitive-intelligence` has source adapters, semantic indexing, artifact store and validation | Add continuous snapshots/diff detection and strategic implication generation |
| 16 | Market Opportunity Detection | MISSING | Research and competitive foundations exist; no dedicated opportunity detector identified | Build opportunity signal aggregation + confidence model |
| 17 | Next Best Action Engine | MISSING | Strategy decision engine exists but no explicit NBA engine identified | Build ranked action recommendations with reason/evidence/impact/confidence/risk/approval |
| 18 | Platform-Specific Strategy Layer | PARTIAL | platform clients/adapters and execution abstractions exist | Separate core strategy from platform adaptation; add channel-specific strategy transformation |
| 19 | Multimodal Creative Intelligence | PARTIAL | SIEL is provider-neutral and creative asset indexing exists; text/vector foundation is present | Extend to image/video/audio embeddings and cross-modal relationships |
| 20 | Agency / Multi-Client Operating Model | PARTIAL | organization/project tenant boundaries and tenant-aware semantic architecture exist | Add explicit Organization → Client → Brand → Project → Campaign hierarchy and enforce isolation across all intelligence stores |

## Priority findings

### Priority 1 — Build next

1. Business Intelligence Model
2. Strategic State / ATLAS Brain
3. Evidence → Insight → Decision typed pipeline
4. Audience Intelligence
5. Creative DNA

These should be implemented as one connected vertical slice rather than five isolated modules.

### Priority 2 — Extend existing learning systems

1. Creative Hypothesis Engine
2. Existing Experimentation Engine
3. Existing Learning Engine
4. Outcome-weighted SIEL
5. Angle Gap Detection

### Priority 3 — Optimization intelligence

1. Creative Fatigue
2. Full message continuity
3. Offer Intelligence
4. Funnel Intelligence
5. Next Best Action

### Priority 4 — Expansion

1. Continuous competitive change detection
2. Market opportunity detection
3. Platform-specific strategy
4. Multimodal SIEL
5. Agency/client hierarchy

## Duplication warnings

Do not create replacement implementations for:

- SIEL / semantic retrieval
- Learning Engine
- Experiment Engine
- Campaign execution
- OAuth/token management
- PostgreSQL persistence
- Research Intelligence Hub
- Orchestration
- Creative Production Engine

Extend their contracts and adapters instead.

## Architectural target

```text
Business Intelligence Model
        ↓
Strategic State / ATLAS Brain
        ↓
Evidence → Observation → Insight → Hypothesis → Decision
        ↓
Orchestrator
        ↓
Research / Audience / Creative / Experiment / Execution specialists
        ↓
Performance + Attribution
        ↓
Learning Engine
        ↓
SIEL + Memory
        ↓
Strategic State update
        ↓
Next Best Action
```

## Audit limitation

This is an implementation-oriented repository audit based on the `dev` tree, existing PDR/architecture documents, and identifiable production modules. A capability is marked IMPLEMENTED only where a corresponding implementation foundation is visible; external deployment credentials, live provider accounts and production infrastructure cannot be considered complete merely from repository code.
