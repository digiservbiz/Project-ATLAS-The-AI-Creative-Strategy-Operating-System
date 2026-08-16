# ATLAS Master Product & Engineering Requirements Document

**Status:** Living specification  
**Version:** 1.0  
**Branch:** `dev`  
**Purpose:** Single source of truth for product behavior, architecture, agents, skills, data, evaluation, security, and implementation.

## 1. Mission

ATLAS is an AI Creative Strategy Operating System for e-commerce teams and agencies. It turns a product, market, customer, and campaign brief into evidence-aware creative strategy, testing hypotheses, angles, hooks, scripts, QA findings, and reusable campaign artifacts.

ATLAS is not intended to be a generic chatbot or a video editor. Its core value is strategic reasoning, structured research, creative hypothesis generation, evaluation, memory, and orchestration.

## 2. Source-of-truth hierarchy

1. Product requirements in this PDR.
2. Architecture and interface contracts.
3. Agent/skill specifications.
4. Evaluation specifications.
5. Implementation code.
6. Operational/project state.

If implementation conflicts with an approved requirement, record the conflict and resolve it deliberately rather than silently changing behavior.

## 3. PDR map

- `01-EXECUTIVE-SUMMARY.md` — product purpose, users, value proposition.
- `02-PRODUCT-REQUIREMENTS.md` — functional and non-functional requirements.
- `03-SYSTEM-ARCHITECTURE.md` — system boundaries and runtime architecture.
- `04-MULTI-AGENT-ARCHITECTURE.md` — orchestration and agent lifecycle.
- `05-AGENT-CATALOG.md` — specialist agent responsibilities.
- `06-SKILLS-SYSTEM.md` — reusable Claude/agent skills.
- `07-CREATIVE-STRATEGY-ENGINE.md` — core creative methodology.
- `08-RESEARCH-INTELLIGENCE.md` — product, market, competitor and ad research.
- `09-KNOWLEDGE-RAG.md` — knowledge ingestion and retrieval.
- `10-MEMORY-SYSTEM.md` — durable organizational/project/campaign memory.
- `11-WORKFLOW-ENGINE.md` — durable orchestration.
- `12-MODEL-GATEWAY.md` — model abstraction and routing.
- `13-TOOLS-MCP.md` — tools, permissions and MCP.
- `14-DATA-DATABASE.md` — data model and persistence.
- `15-API.md` — service/API requirements.
- `16-FRONTEND.md` — dashboard requirements.
- `17-EVALUATION.md` — quality measurement and regression testing.
- `18-SECURITY-GOVERNANCE.md` — security, tenancy, approvals and governance.
- `19-OBSERVABILITY.md` — tracing, metrics, cost and auditability.
- `20-INTEGRATIONS.md` — external platform integrations.
- `21-DEPLOYMENT-SCALABILITY.md` — environments and scaling.
- `22-IMPLEMENTATION-ROADMAP.md` — phased build plan.

## 4. Core product loop

```text
Brief
  → Context & Research
  → Customer/Problem Model
  → Creative Strategy
  → Angle Matrix
  → Hook Concepts
  → Creative Scripts
  → QA / Evidence / Risk Checks
  → Campaign Package
  → Human Approval
  → Launch/Test
  → Performance Data
  → Learning / Memory
  → Next Strategy Iteration
```

## 5. Strategic principles

ATLAS must encode the following principles as explicit, testable heuristics rather than vague prompt instructions:

- **Hook-to-offer continuity:** the promise established by the creative must be reflected in the offer and landing-page experience.
- **Proof-first framing:** where evidence is available, show concrete proof/demo before relying on polished explanation.
- **One product, many hypotheses:** a product is not declared a winner/loser from a single creative angle. ATLAS should generate and prioritize materially different buyer motivations.
- **Buyer-specific angles:** pain/problem, benefit, proof, ego/status, gifting, competitor comparison, objection handling, curiosity, demonstration, identity and other relevant motivations.
- **Skepticism reduction:** identify scam/fraud concerns and recommend credible proof, transparency, demonstrations, guarantees, reviews or other appropriate evidence when available.
- **Direct-response orientation:** evaluate creative by its intended business outcome, not editing complexity or visual polish alone.
- **Strategist vs editor:** ATLAS owns the strategic hypothesis and creative architecture; production instructions are downstream execution artifacts.
- **Evidence discipline:** never fabricate customer reviews, performance claims, competitor facts, research findings or product capabilities.
- **Testing discipline:** every creative recommendation should have a hypothesis, audience, intended behavior, evidence basis, and success criteria when those are knowable.

## 6. Definition of done for PDR v1.0

The PDR is considered complete when every system boundary has: purpose, users/actors, inputs, outputs, invariants, failure modes, security considerations, dependencies, evaluation criteria, and implementation mapping. Individual files can evolve without changing this index.

## 7. Implementation rule

The PDR is intentionally separated from source code. Requirements become executable only after they have corresponding contracts, skills, agents, workflows, tests, or UI/API behavior. No document requirement should be treated as implemented merely because it is written here.
