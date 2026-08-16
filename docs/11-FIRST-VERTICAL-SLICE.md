# ATLAS AI — First Vertical Slice

**Version:** 1.0.0
**Branch:** `dev`

## Objective

Prove that ATLAS can accept a product brief, research the product, generate a creative strategy, produce multiple angles/hooks/scripts, validate the output, and persist the resulting campaign package.

## User Input

```json
{
  "product": {
    "name": "Example Product",
    "description": "Product description",
    "url": null,
    "price": null
  },
  "audience": {
    "description": "Target customer",
    "market": "US"
  },
  "offer": {
    "description": "Current offer"
  },
  "objective": "Generate direct-response creative concepts"
}
```

## Workflow

```text
API Intake
   ↓
Orchestrator
   ↓
Product Research
   ↓
Creative Strategy
   ↓
Angle Generator
   ↓
Hook Generator
   ↓
Script Writer
   ↓
QA Validator
   ↓
Campaign Package Artifact
```

## Step 1 — Intake

Validate the request against the campaign input schema.

Reject requests that lack enough product context to produce meaningful strategy.

## Step 2 — Product Research

The Product Research Agent should identify:

- Core problem
- Desired outcome
- Functional benefits
- Emotional benefits
- Objections
- Proof opportunities
- Differentiators
- Likely use cases
- Buying triggers
- Risk/fear factors

Research must distinguish between facts supplied by the user, retrieved evidence, and model hypotheses.

## Step 3 — Creative Strategy

The Creative Strategy Agent converts research into a testing strategy.

It should define:

- Primary audience segments
- Core pain points
- Desired outcomes
- Strategic message territories
- Proof strategy
- Creative principles
- Testing priorities

### ATLAS Creative Strategy Principles

The initial strategy knowledge includes:

1. **Hook-to-offer message match:** the landing page should continue the promise and pain point introduced by the creative.
2. **Proof-first framing:** demonstrate tangible evidence early when skepticism is likely.
3. **One product, multiple angles:** test meaningful buyer motivations before concluding that a product is a loser.
4. **Angle diversity:** examples include pain/problem, status/ego, gifting, convenience, proof, comparison, objection reversal, identity and transformation.
5. **Creative strategist over editor:** production polish is not a substitute for a strong direct-response concept.

These are strategy heuristics, not universal laws. The system should test them against evidence.

## Step 4 — Angle Generator

Generate a prioritized set of distinct strategic angles.

Each angle must include:

- `angle_id`
- `name`
- `buyer_motivation`
- `problem`
- `promise`
- `proof_direction`
- `hook_direction`
- `why_test`
- `priority`

Angles must be meaningfully different. Rephrasing the same promise does not count as a new angle.

## Step 5 — Hook Generator

For selected angles, generate multiple hooks.

Each hook should specify:

- Hook text
- Hook type
- Angle ID
- Visual opening
- Proof opportunity
- Intended emotion
- Risk/claim note

The system should favor hooks that create curiosity while clearly connecting to the eventual offer.

## Step 6 — Script Writer

Convert selected hooks into short-form direct-response scripts.

Structure:

```text
Hook
↓
Problem / tension
↓
Mechanism / demonstration
↓
Proof
↓
Offer
↓
CTA
```

The exact structure may change when the creative concept requires it.

## Step 7 — QA Validator

Validate:

- Hook/offer continuity
- Angle uniqueness
- Product accuracy
- Unsupported claims
- Clear CTA
- Audience relevance
- Proof quality
- Brand constraints
- Script completeness
- Schema validity

The QA agent should flag problems rather than silently rewriting strategic decisions unless explicitly instructed.

## Final Artifact

The workflow produces one `campaign-package` artifact containing:

```text
Executive Summary
Product Research
Creative Strategy
Angle Matrix
Selected Hooks
Scripts
Proof Recommendations
Landing Page Message-Match Notes
Testing Plan
QA Report
Open Questions
```

## Acceptance Criteria

The vertical slice passes when:

- A valid API request creates a workflow run.
- Each agent executes through the same runtime contract.
- Outputs validate against schemas.
- Workflow state persists after every step.
- A failed step can be retried without corrupting previous artifacts.
- QA can block an invalid final package.
- The final package is persisted and retrievable.
- Execution history shows every agent, version, status and artifact.
- No external side effect occurs without approval.

## Non-Goals

The first slice does not require:

- Automatic ad publishing.
- Live ad account changes.
- Fully autonomous web browsing.
- Every ATLAS agent.
- Production billing.
- Complex multi-agent debate loops.

## Demonstration Scenario

Use a real product brief and run the workflow end-to-end. Save the input and final output as evaluation fixtures so future architecture changes can be regression-tested.
