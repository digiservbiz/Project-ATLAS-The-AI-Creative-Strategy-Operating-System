# 07 — Creative Strategy Engine

## Purpose

The Creative Strategy Engine is ATLAS's core domain reasoning layer. It converts product/customer/market context into testable creative hypotheses rather than merely producing copy.

## Strategy object

Every strategy MUST contain:

1. target audience;
2. customer problem/job;
3. desired transformation;
4. primary promise;
5. proof/evidence requirements;
6. objections and skepticism risks;
7. offer implications;
8. landing-page continuity requirements;
9. angle families;
10. testing hypotheses;
11. confidence and unknowns.

## Hook-to-offer-to-LP continuity

The system MUST check that the creative promise survives the complete customer journey:

```text
Hook → Creative Promise → Product Mechanism → Offer → Landing Page → CTA
```

A high-click hook that introduces a different promise on the landing page MUST be flagged as a continuity risk.

## Proof-first framing

When a claim can be demonstrated, ATLAS SHOULD prioritize a concrete demonstration, product use, unboxing, comparison, test, customer evidence, or other credible proof before decorative explanation. The system MUST distinguish available evidence from proposed evidence that still needs to be captured.

## Angle taxonomy

The engine SHOULD consider, when relevant:

- Pain/problem
- Desired benefit
- Demonstration/proof
- Ego/status
- Identity/belonging
- Gifting
- Competitor/alternative
- Objection reversal
- Curiosity
- Before/after transformation
- Convenience/time saving
- Cost/value
- Risk reduction
- Authority/expertise
- Social proof
- Use case/context
- Seasonal/event
- Mechanism/how-it-works
- Contrarian insight
- Comparison

Angles must be materially different hypotheses, not superficial synonym swaps.

## Testing model

Each angle SHOULD be represented as:

```yaml
angle_id: unique-id
name: human-readable name
buyer_motivation: category
hypothesis: why this may influence the buyer
hook_direction: opening concept
proof_needed: evidence/assets
offer_alignment: required offer connection
landing_page_alignment: required LP message
risk_flags: []
confidence: low|medium|high
```

## Creative QA rules

The engine MUST flag:

- unsupported factual claims;
- fake testimonials/reviews;
- misleading before/after claims;
- unsubstantiated competitor attacks;
- promise/landing-page mismatch;
- proof claims without evidence;
- excessive generic hype;
- angles that are substantially duplicates;
- missing CTA/offer logic;
- mismatch between audience and message.

## Decision principle

ATLAS should optimize for **quality of learning and quality of hypotheses**, not claim that any individual creative will win. Performance data later becomes evidence for future strategy through the memory/evaluation system.

## Human strategy control

Users must be able to modify audience, angle priorities, claims, evidence, constraints, offer assumptions and final selections before production or publication.
