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
3. Replace deterministic outputs with actual model-powered agent outputs behind the model gateway.
4. Add persistent authenticated run storage before exposing the API beyond local testing.

## Safety boundary

The current demo is safe-local only. It does not publish ads, spend budget, or perform external platform actions. Human approval remains required before any future paid execution.
