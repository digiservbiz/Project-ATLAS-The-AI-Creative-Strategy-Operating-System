# Persistence Intelligence Layer

The intelligence layer now exposes a persistence boundary without coupling the domain contracts to a specific database driver.

## Scope

Persistable intelligence entities:

- Strategic State
- Decisions
- Hypotheses
- Experiments
- Learnings
- Creative DNA
- Audience intelligence

Every record is wrapped with:

- `businessId` — mandatory tenant scope
- `entityType`
- `version`
- `evidenceIds` for provenance linkage
- timestamps

## Architecture

`Intelligence modules → PersistenceEnvelope → IntelligenceRepository → database adapter`

The repository contract is deliberately storage-agnostic. The included in-memory implementation is a reference/test adapter; it is **not** the production database adapter.

A future PostgreSQL adapter can implement the same contract and map embeddings to the existing pgvector/SIEL infrastructure without changing the intelligence domain API.

## Isolation rule

Reads, writes, and future vector retrieval must be scoped by `businessId`. A record from another business must be rejected rather than silently returned.
