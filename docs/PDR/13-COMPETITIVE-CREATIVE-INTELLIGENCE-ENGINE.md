# 13 — Competitive Creative Intelligence Engine (CCIE)

**Status:** Architecture specification v1.0

## Purpose

CCIE gives ATLAS a controlled way to study publicly available and authorized advertising/creative intelligence from external platforms and turn it into evidence for strategy, without treating public visibility as proof of performance.

## Supported intelligence sources

Initial source categories:

- Meta Ad Library / authorized Meta ad data
- TikTok Creative Center / Commercial Content Library
- Authorized platform APIs and datasets
- Customer-provided creative libraries
- ATLAS campaign-performance data

Adapters must be provider-specific and isolated behind a common connector interface.

## Data pipeline

```text
Source
  ↓
Connector
  ↓
Normalize
  ↓
Provenance + policy checks
  ↓
Creative extraction
  ├── video/image asset metadata
  ├── copy
  ├── hook
  ├── CTA
  ├── offer
  ├── visual structure
  ├── format
  ├── market
  └── available platform metadata
  ↓
Semantic Intelligence / Embeddings
  ↓
Creative Knowledge Store
  ↓
Strategy + Research Agents
```

## What CCIE analyzes

- Hook patterns
- Opening-frame patterns
- Creative formats
- Demonstrations
- UGC structures
- Problem/solution structures
- Proof patterns
- Offer structures
- CTA patterns
- Buyer motivations
- Objection handling
- Positioning
- Angle families
- Product/category patterns
- Language and market differences
- Creative fatigue/repetition signals when sufficient longitudinal data exists

## Performance evidence discipline

CCIE must distinguish three classes of evidence:

### A. Verified first-party performance
Metrics from a customer's authorized advertising account, such as spend, impressions, clicks, conversions, CPA, ROAS and creative-level performance where available.

### B. Platform-provided public performance signals
Metrics or rankings explicitly exposed by a platform's public creative intelligence tools.

### C. Market observation
The ad exists, is active, has been visible for a period, or exhibits a particular creative pattern. This is not verified conversion performance.

ATLAS must never silently convert class C into class A.

## Meta integration

Meta Ad Library is treated as a market-intelligence source for discoverable ads. The integration must respect Meta's available access mechanisms, platform terms, permissions, and data restrictions.

Authorized Meta Marketing API integration is a separate connector for the customer's own advertising data and campaign operations.

## TikTok integration

TikTok Creative Center provides public creative inspiration, Top Ads, trends, and related creative insights. TikTok's Commercial Content Library provides access to commercial content, including advertising content in supported regions. These sources should be treated as external intelligence feeds, subject to platform availability and policies.

TikTok account integrations are separate from public-market intelligence and are used for the customer's authorized performance and campaign data.

## Semantic analysis

Each normalized creative should be represented semantically so ATLAS can compare concepts rather than only exact text.

Examples of potentially equivalent concepts:

- "No drilling"
- "Protect your rental walls"
- "Install without damaging the wall"

The system should identify the common concept while retaining each creative's original wording and provenance.

## Competitive creative database

A normalized creative record should include:

```text
source
source_ad_id
advertiser
market
language
platform
first_seen
last_seen
status
copy
asset_reference
format
angle_family
hook
offer
cta
semantic_concepts
embedding_id
public_signals
provenance
```

## Competitive analysis workflow

```text
Brand/Product brief
       ↓
Define category + market + competitors
       ↓
Collect permitted public/authorized creative data
       ↓
Normalize
       ↓
Semantic clustering
       ↓
Pattern analysis
       ↓
Compare against client's historical performance
       ↓
Identify opportunities / gaps
       ↓
Generate testable hypotheses
```

## Learning loop

CCIE should not directly "copy winners." It should produce strategic hypotheses.

Example:

```text
Market observation:
Proof-first demonstrations appear frequently in the category.

Client evidence:
The client's proof-first creatives have stronger conversion than generic benefit ads.

ATLAS hypothesis:
Increase testing of proof-first demonstrations for this product.

Action:
Generate 5 materially different proof-first concepts.
```

## Legal and policy boundaries

ATLAS must use only data that is publicly accessible or obtained through authorized APIs/accounts and must respect applicable platform terms, licenses, privacy requirements, robots/access controls, and intellectual-property constraints.

CCIE is an intelligence system, not a mechanism for bypassing platform restrictions.

External creative assets should be referenced, analyzed, or transformed only where the applicable rights and platform permissions allow it.

## Acceptance criteria

CCIE v1 is complete when ATLAS can:

1. connect to at least one permitted public creative-intelligence source;
2. normalize external creative records;
3. preserve provenance;
4. distinguish market observation from verified performance;
5. embed and cluster creative concepts through SIEL;
6. retrieve category/competitor patterns;
7. compare public signals with the customer's first-party campaign data;
8. produce evidence-backed creative hypotheses;
9. feed those hypotheses into Creative Strategy and Angle Generation;
10. maintain tenant isolation and connector-level permissions.

## Future expansion

- Additional ad platforms
- Automated category monitoring
- Competitor change alerts
- Creative trend timelines
- Semantic creative fatigue detection
- Cross-market pattern transfer
- Multimodal creative embeddings
- Outcome-weighted concept graphs
