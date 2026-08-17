# 15 — Ad Platform Integration & Execution Layer

**Status:** Architecture specification v1.0

## Purpose

This layer connects ATLAS to authorized advertising accounts so it can ingest first-party campaign data and, after approval, create or modify campaigns and publish approved creative assets.

## Initial platforms

- Meta Marketing API
- TikTok Ads APIs
- Google Ads

Additional platforms are adapter-driven.

## Two distinct capabilities

### Intelligence

Read authorized account data:

- campaigns
- ad sets / ad groups
- ads
- creatives
- spend
- impressions
- reach
- clicks
- CTR
- CPC
- conversions
- CVR
- CPA
- ROAS
- frequency
- placement/device/geo breakdowns where available

### Execution

Potentially create/update:

- campaigns
- ad groups/ad sets
- ads
- creative associations
- budgets
- targeting
- schedules
- status

Exact actions depend on each platform's API permissions and policy.

## Approval boundary

Paid-media actions are consequential actions.

Default policy:

```text
ATLAS recommendation
      ↓
Validation
      ↓
Human approval
      ↓
Execution adapter
      ↓
Platform API
      ↓
Verification
```

The system must not silently spend money.

Customers may later configure controlled automation policies with explicit limits such as maximum daily spend, allowed accounts, campaign types, and approval rules.

## Data normalization

Platform-specific metrics should map into a common internal model while retaining the original platform fields.

```text
platform
account_id
campaign_id
ad_group_id
ad_id
creative_id
metric
value
currency
window
attribution_setting
retrieved_at
source
```

## Attribution discipline

ATLAS must preserve the platform's attribution window/settings when analyzing performance. Cross-platform metrics should not be compared as if their definitions are automatically identical.

## Campaign creation workflow

```text
Strategy
 ↓
Campaign specification
 ↓
Creative assets
 ↓
Audience + budget recommendation
 ↓
Policy/claim validation
 ↓
Human approval
 ↓
Platform adapter
 ↓
Create campaign
 ↓
Verify returned IDs/status
 ↓
Store execution record
```

## Optimization loop

```text
Campaign performance
 ↓
Analytics
 ↓
Creative semantic analysis
 ↓
Hypothesis generation
 ↓
New creative concepts
 ↓
Production
 ↓
QA
 ↓
Approval
 ↓
New test
```

## Safety controls

Every execution request must include:

- tenant
- connected account
- requested action
- budget impact
- target platform
- approval state
- actor/audit identity
- idempotency key

Destructive or high-cost operations require stronger confirmation.

## Credentials

Platform credentials must be encrypted/secured and never stored in source control or prompts. Tokens must be scoped to the minimum required permissions.

## Acceptance criteria

The initial execution layer is complete when ATLAS can:

1. connect an authorized account securely;
2. ingest first-party campaign performance;
3. normalize metrics;
4. associate performance with creative assets;
5. generate an execution plan;
6. require approval before paid execution;
7. create an approved campaign through an adapter;
8. verify execution;
9. record the complete audit trail;
10. feed results back into analytics, SIEL, and memory.
