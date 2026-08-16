# ATLAS AI — Agent Catalog

**Version:** 1.0.0  
**Status:** Planned/Specified  
**Branch:** `dev`

This catalog defines the initial specialist-agent map. It is intentionally larger than the first MVP so the long-term architecture is explicit, while implementation remains phased.

## Executive Control

### Orchestrator
Coordinates workflows, state, agent routing, approvals and completion. It does not replace specialist reasoning.

### Project Manager
Turns approved objectives into project plans, dependencies, milestones and task status.

### QA Validator
Validates outputs against schemas, requirements, evidence rules and quality criteria.

### Memory Manager
Extracts, classifies, updates and retrieves durable project memories.

## Research

### Market Research
Analyzes market structure, demand signals, trends, categories and opportunities.

### Customer Research
Builds evidence-backed customer understanding: motivations, objections, language, jobs-to-be-done and buying triggers.

### Product Research
Analyzes product features, benefits, mechanisms, use cases, proof opportunities and objections.

### Competitor Intelligence
Analyzes competitors, positioning, offers, creative patterns and gaps.

### Review Mining
Extracts recurring praise, complaints, objections, desired outcomes and customer language from reviews.

### Trend Research
Identifies relevant cultural, platform, search and category trends and separates signal from noise.

## Strategy

### Positioning
Defines differentiated market positioning and strategic message territory.

### Offer Strategy
Designs offer structure, bonuses, guarantees, urgency and value communication within factual constraints.

### Creative Strategy
Transforms research into creative testing strategy and prioritized message territories.

### Messaging
Builds message architecture across ads, landing pages and other customer touchpoints.

### Angle Generator
Creates meaningfully distinct buyer-motivation angles for testing.

## Copy

### Hook Generator
Creates opening concepts and copy aligned with specific angles and proof opportunities.

### Headline Generator
Creates headlines for ads, landing pages and campaign assets.

### Script Writer
Turns concepts into direct-response video scripts.

### Storytelling
Builds narrative structures where storytelling improves persuasion.

### CTA Optimizer
Creates and evaluates calls to action based on context and friction.

## Creative Production Strategy

### Creative Director
Turns strategic concepts into production-ready creative briefs.

### Shot Planner
Creates visual sequences, shot lists and demonstration plans.

### UGC Director
Designs authentic UGC concepts, creator direction and performance structures.

### Thumbnail Strategist
Plans visual packaging for environments where thumbnails materially affect discovery.

### Creative Auditor
Audits existing creative against strategy, clarity, proof, hook strength and message match.

## Conversion

### Landing Page Strategist
Ensures landing-page messaging continues the promise and pain point introduced by acquisition creative.

### Funnel Optimizer
Analyzes customer journey friction and message continuity across funnel stages.

### CRO Auditor
Identifies conversion friction and prioritizes experiments.

## Analytics

### Performance Analyst
Interprets campaign and creative metrics in context rather than optimizing a single metric blindly.

### Creative Testing Planner
Designs controlled creative tests and isolates meaningful variables.

### Scaling Advisor
Provides evidence-based scaling recommendations and identifies when performance is not robust enough to scale.

## Implementation Priority

### Tier 1 — First Vertical Slice

- Orchestrator
- Product Research
- Creative Strategy
- Angle Generator
- Hook Generator
- Script Writer
- QA Validator

### Tier 2 — Strategy Depth

- Customer Research
- Review Mining
- Competitor Intelligence
- Positioning
- Offer Strategy
- Messaging
- Landing Page Strategist
- Creative Auditor

### Tier 3 — Production and Optimization

- Market Research
- Trend Research
- Creative Director
- Shot Planner
- UGC Director
- Funnel Optimizer
- CRO Auditor
- Performance Analyst
- Creative Testing Planner
- Scaling Advisor

### Tier 4 — Executive/Operational Expansion

- Project Manager
- Memory Manager
- Headline Generator
- Storytelling
- CTA Optimizer
- Thumbnail Strategist

## Cross-Agent Rule

Agents should produce specialist outputs that another agent can consume. They should not attempt to be a universal marketing assistant.

Every agent must have explicit ownership, inputs, outputs and evaluation criteria before production implementation.
