# ATLAS Delivery Status

Last updated: 2026-10-31
Branch: `dev`

## Current estimate

**60% toward the complete production vision.** This is an engineering estimate, not code or test coverage.

## Latest completed work

- Downstream demo agents validate and receive their immediate upstream artifact handoff.
- Workflow outputs retain the consumed artifact ID and payload for inspection.
- Workflow stage failures are now attributed to the stage that actually has a blocking error, preserving the completed prefix.
- Agent runtime validates execution envelopes before agent lookup and executes normalized schema output.
- Anthropic model adapter now validates generation parameters, applies a request timeout, normalizes token usage, rejects empty/malformed responses, and classifies rate-limit, timeout, and provider-unavailable errors without exposing provider response bodies.
- Added Model Gateway tests for explicit provider routing, duplicate registration, missing providers, and Anthropic success/failure handling.
- Added `createModelBackedCreativeStrategyAgent` in `@atlas/agents`, using an explicitly supplied provider/model and validating structured strategy output before returning it.
- The model-backed strategy agent always returns `needs_review`; malformed model output and provider errors cannot become approved strategy artifacts.
- Added tests for valid JSON, fenced JSON, missing fields, provider errors, and required model configuration.
- Added a tenant-scoped API strategy service that creates an execution envelope, invokes the model-backed agent through `AgentRuntime`, and returns validated strategy output for review.
- Added `POST /v1/strategy/generate`, configured only when `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` are present; missing configuration returns a clear 503 response.
- Added API service tests for successful model-backed strategy generation and pre-model tenant/product validation.
- Added a live AI strategy smoke-test guide; provider credentials remain environment-only.
- Added malformed-envelope rejection coverage.
- Added `docs/TESTING.md` with safe local install, test, demo, API smoke-test, and failure-path instructions.

## Verification status

**Not yet CI-verified.** Tests were committed, but the available GitHub status lookup did not provide a passing Actions result. Do not treat the current state as production-ready.

## Immediate test gate

Run from the repository root:

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm demo
```

The normal demo should complete all eight stages and end in `needs_review`, with no external spend or publishing. The forced invalid-budget scenario should fail at the execution stage after preserving the four completed upstream stages.

## Remaining before a meaningful user test

1. Obtain a passing CI run for typecheck, tests, and build.
2. Start the local API and verify `/health`, `/v1/runtime/status`, and `POST /v1/demo/runs`.
3. Run the first live API strategy test with a configured Anthropic key and verify generated strategy quality and review behavior.
4. Add persistent authenticated run storage before exposing the API beyond local testing.

## Safety boundary

The current demo is safe-local only. It does not publish ads, spend budget, or perform external platform actions. Human approval remains required before any future paid execution.
