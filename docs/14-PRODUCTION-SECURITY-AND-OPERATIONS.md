# ATLAS Production Security & Operations

## Security baseline
- Store OAuth refresh/access tokens only behind the SecretStore boundary; never commit credentials.
- Use least-privilege provider scopes and separate credentials per organization/account.
- Encrypt database and backups at rest and require TLS in transit.
- Treat campaign publishing, budget changes and destructive actions as approval-gated until explicit policy permits automation.
- Validate webhook signatures before processing provider events.
- Redact tokens, authorization codes, cookies and customer PII from logs.
- Apply tenant/organization filters at every persistence boundary.
- Rotate provider credentials and encryption keys on a defined schedule.

## Durable jobs
Production workers should use the Postgres job store with `FOR UPDATE SKIP LOCKED`, leases/lock expiry, retry backoff and idempotency keys. Workers must be horizontally scalable and safe to restart.

## Observability
Every workflow/job should carry correlation IDs: organization, project, campaign, job and provider request IDs. Track latency, retries, provider errors, queue depth, token refresh failures, spend changes and publishing outcomes.

## Recovery
Back up PostgreSQL, test restores, retain migration history, and define RPO/RTO before enabling autonomous budget or publishing actions.

## Production gates
1. Provider OAuth credentials configured and verified.
2. Production database and durable worker infrastructure provisioned.
3. End-to-end integration tests pass against provider sandboxes/test accounts where available.
4. Security/tenant-isolation tests pass.
5. Approval policy configured for high-impact actions.
6. Monitoring and alerting enabled.

ATLAS code can provide these boundaries, but real credentials, infrastructure and provider authorization must be configured outside the repository before production autonomy is enabled.
