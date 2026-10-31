# ATLAS Local Test Guide

ATLAS currently has a safe deterministic demo. It does not publish ads, spend money, or require model-provider credentials.

## Requirements

- Node.js 22
- pnpm 10.14.0
- Git access to this repository

## Install and verify

From the repository root:

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Run the end-to-end deterministic workflow:

```bash
pnpm demo
```

Run the model gateway's isolated provider tests:

```bash
pnpm --filter @atlas/model-gateway test
```

The Anthropic adapter is covered with mocked HTTP responses; these tests do not spend API credits and do not require an API key. The live provider call is intentionally not part of the default test suite.

Start the local API:

```bash
pnpm dev
```

## Optional live AI strategy test

The API now exposes a controlled strategy-generation endpoint. It calls the model-backed strategy agent through the Agent Runtime and requires human review. It does not publish ads or perform paid actions.

Set the provider configuration in your local shell before starting the API:

```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export ANTHROPIC_MODEL="your-enabled-model-id"
pnpm dev
```

Send a product brief:

```bash
curl -X POST http://localhost:3000/v1/strategy/generate \\
  -H 'content-type: application/json' \\
  -d '{
    "organizationId": "org-local-test",
    "projectId": "project-local-test",
    "productBrief": {
      "productName": "Example kitchen helper",
      "customerProblem": "Meal preparation takes too long",
      "audience": "Busy families",
      "offer": "Starter bundle"
    }
  }'
```

Expected response status is `needs_review` when generation succeeds. If credentials or model configuration are missing, the endpoint returns `503 MODEL_PROVIDER_NOT_CONFIGURED`. Provider errors or invalid model output remain review-required and do not become approved strategy.

Do not commit API keys or put them in source files.

Then check health:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/v1/runtime/status
```

## Run a demo through the API

Create a safe demo run:

```bash
curl -X POST http://localhost:3000/v1/demo/runs \
  -H 'content-type: application/json' \
  -d '{}'
```

The response includes the run ID, eight workflow stages, artifact counts, workflow status, next actions, and warnings/failures. Use the returned run ID to inspect the in-process run:

```bash
curl http://localhost:3000/v1/demo/runs/<RUN_ID>
```

Note: demo runs are currently held in process memory. Restarting the API clears them. Durable PostgreSQL-backed API storage and authentication are not yet complete.

## What a successful baseline looks like

- Eight stages execute in order: product, strategy, intelligence-decision, orchestrator, execution, performance, learning, next-action.
- Eight lineage-linked artifacts are persisted by the demo repository.
- Each downstream workflow output records the identity and payload of its immediate upstream artifact.
- The normal demo ends in `needs_review` because the next action requires human approval.
- The demo never performs external publishing or paid execution.

## Failure-path check

The API accepts scenario overrides. To force an invalid execution budget and verify that the workflow stops at the execution stage:

```bash
curl -X POST http://localhost:3000/v1/demo/runs \
  -H 'content-type: application/json' \
  -d '{"overrides":{"budgetCents":0}}'
```

The workflow should mark the execution stage failed while retaining the completed prefix.

## Verification status

The repository changes include automated tests for artifact handoff and malformed execution envelopes. These tests must still pass the GitHub Actions quality workflow before this guide can be considered verified. No passing CI result is claimed here.
