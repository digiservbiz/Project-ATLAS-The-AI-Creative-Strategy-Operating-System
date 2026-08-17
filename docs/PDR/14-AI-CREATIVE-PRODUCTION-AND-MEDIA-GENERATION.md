# 14 — AI Creative Production & Media Generation

**Status:** Architecture specification v1.0

## Purpose

ATLAS must be able to turn approved creative strategies into production-ready image, video, voice, avatar, and derivative creative assets through provider-neutral AI generation adapters.

## Architecture

```text
Creative Strategy
      ↓
Creative Brief
      ↓
Production Planner
      ↓
Media Generation Gateway
 ┌────┼─────┬──────┬──────┐
 ↓    ↓     ↓      ↓      ↓
Image Video Voice Avatar Edit
 AI     AI    AI     AI    AI
 └──────┼─────┴──────┴──────┘
        ↓
Creative QA
        ↓
Human approval
        ↓
Campaign asset library
```

## Provider neutrality

No strategy agent should depend directly on one media-generation provider.

The gateway must support replaceable adapters for:

- image generation
- image editing
- video generation
- video transformation
- voice generation
- avatar/presenter video
- audio/music where licensed
- resizing and format adaptation
- background/product compositing

Provider capabilities, cost, latency, safety restrictions, licensing, and supported formats must be discoverable by the planner.

## Production brief

Every generation request should contain:

```text
creative_concept
angle
hook
objective
target_audience
market
brand_guidelines
product_reference
script
visual_direction
format
aspect_ratio
duration
cta
claims_constraints
required_disclosures
provider_constraints
```

## Product fidelity

When product assets are supplied, the system should preserve product identity and avoid inventing materially different product features.

Generated assets must be checked against the source product information.

## Creative formats

Initial targets:

- 9:16 short-form video
- 1:1 image
- 4:5 social image/video
- 16:9 video
- product demonstration
- UGC-style concept
- testimonial concept
- before/after concept
- product hero
- static direct-response ad

Exact platform specifications remain connector-specific and must be refreshed from platform requirements.

## Creative QA

Before approval, ATLAS should evaluate:

- hook visibility
- message clarity
- product visibility
- product fidelity
- script/visual alignment
- angle alignment
- offer consistency
- CTA presence
- brand consistency
- landing-page continuity
- unsupported claims
- prohibited or risky content
- platform format requirements

## Human approval

Generation may be automated, but external publication or paid media activation requires an explicit approval boundary unless the customer has deliberately configured an authorized automation policy.

## Asset lineage

Every generated asset must retain:

```text
asset_id
parent_brief_id
source_assets
provider
model
prompt_version
skill_version
generation_parameters
created_at
approval_status
qa_results
rights_metadata
```

This enables reproducibility, auditing, and future performance learning.

## Learning loop

After publication, performance data should be associated with the exact asset and semantic creative concept that produced it.

```text
Generated Asset
      ↓
Published
      ↓
Performance
      ↓
Semantic concept + creative attributes
      ↓
Evaluation
      ↓
Memory
      ↓
Next generation hypothesis
```

## Safety and rights

ATLAS must not assume that an AI-generated asset is automatically licensed for every commercial use. Provider-specific licensing and customer-provided asset rights must be preserved as metadata and checked where possible.

The system must not intentionally reproduce protected third-party creative assets merely because they are found in a public ad library.

## Acceptance criteria

Production v1 is complete when ATLAS can:

1. convert a strategy artifact into a structured production brief;
2. select a compatible media provider;
3. generate or edit an asset through a provider adapter;
4. preserve product and brand constraints;
5. run automated creative QA;
6. store asset lineage and provider metadata;
7. route the asset through human approval;
8. publish through an authorized platform connector;
9. associate performance data with the resulting asset;
10. feed performance evidence back into SIEL and memory.
