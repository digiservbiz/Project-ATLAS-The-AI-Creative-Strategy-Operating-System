# Project ATLAS — The AI Creative Strategy Operating System

ATLAS is a business-agnostic AI operating system for research, strategic intelligence, creative planning, execution orchestration, performance learning, and continuous optimization.

## Architecture

```text
Business / Product / Research
            ↓
   Intelligence + Evidence
            ↓
 Strategic State + Memory
            ↓
 Next-Best-Action Decision
            ↓
     Orchestrator / Agents
            ↓
 Creative Production / Campaign Tools
            ↓
 Meta / TikTok / Shopify / External Providers
            ↓
 Performance + Outcomes
            ↓
      Learning → Memory
            ↺
```

The system is intentionally provider-agnostic. External credentials and account-level actions are injected through adapters; ATLAS does not hard-code provider secrets into the core engine.

## Repository layout

- `packages/intelligence` — strategic state, evidence, next-best-action, learning, persistence, semantic intelligence.
- `packages/orchestrator` — workflow execution and approval lifecycle.
- `packages/automation` — operating loop and bounded autonomous loop.
- `packages/creative-intelligence` — product analysis, strategy decisions, creative planning.
- `packages/competitive-intelligence` — research ingestion and tenant-scoped evidence.
- `packages/ad-platforms` — Meta/TikTok provider boundaries and performance synchronization.
- `packages/creative-production` — image/video/audio production contracts and provider gateways.
- `packages/runtime` — durable workflow runtime and approval resume.
- `apps/api` — local application entry point for smoke testing the ATLAS engine.
- `docs/` — architecture, PDR, implementation roadmap, and operational documentation.

## Local setup

Requirements: Node.js 22+ and pnpm 10.14+.

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Start the local API:

```bash
pnpm dev
```

The API defaults to `http://localhost:3000`.

Health check:

```bash
curl http://localhost:3000/health
```

Exercise the intelligence engine without any external API key:

```bash
curl -X POST http://localhost:3000/v1/intelligence/actions \
  -H "content-type: application/json" \
  -d '{"fatigueScore":0.82,"angleGap":true,"learningConfidence":0.9}'
```

## Quality gate

GitHub Actions runs typecheck, tests, and build on pushes and pull requests targeting `main` and `dev`.

## Production boundary

Local completion does not mean provider deployment is complete. Production still requires real database migrations, OAuth/provider scopes, secrets, scheduling, observability, and deployment configuration. Critical spend or account-state actions remain approval-gated.
