# 08 — Semantic Intelligence & Embedding Layer (SIEL)

**Status:** Architecture specification v1.0  
**ATLAS version:** 0.8.0  
**Role:** Core intelligence subsystem

## 1. Purpose

The Semantic Intelligence & Embedding Layer (SIEL) gives ATLAS a semantic representation of products, customers, problems, offers, creatives, hooks, scripts, landing-page messages, research findings, memories, and campaign outcomes.

SIEL is not merely a vector database feature. It is the semantic layer used to compare, retrieve, cluster, deduplicate, classify, and discover relationships across ATLAS knowledge and creative artifacts.

## 2. Architectural position

```text
User / API
   ↓
Orchestrator
   ↓
Agent Runtime
   ↓
Semantic Intelligence & Embedding Layer
   ├── Embedding generation
   ├── Semantic retrieval
   ├── Similarity scoring
   ├── Clustering
   ├── Deduplication
   ├── Pattern detection
   └── Semantic memory retrieval
          ↓
Knowledge / RAG / PostgreSQL + pgvector
```

SIEL is consumed by research, strategy, angle generation, creative QA, memory, and evaluation agents.

## 3. Core capabilities

### 3.1 Embedding generation
Convert approved text and structured semantic objects into embeddings using a configurable embedding provider.

The provider must be replaceable. Embedding model identifiers, dimensions, and versions must be stored with every vector.

### 3.2 Semantic retrieval
Retrieve conceptually relevant knowledge even when the query uses different wording.

Example:

- `No drilling required`
- `Install without damaging the wall`

should be recognized as semantically related rather than treated as unrelated strings.

### 3.3 Similarity matching
Calculate semantic similarity between:

- creatives
- hooks
- angles
- offers
- objections
- customer problems
- research findings
- memories
- landing-page messages

Similarity scores are evidence, not truth. Thresholds must be configurable and evaluated against domain-specific datasets.

### 3.4 Creative deduplication
Detect creatives or proposed angles that are materially similar even when their wording differs.

ATLAS must distinguish:

- wording variation
- genuine creative variation
- superficial variation
- materially different buyer hypotheses

### 3.5 Creative clustering
Group creative artifacts by semantic concepts such as pain, status, gifting, proof, convenience, objection, competitor comparison, demonstration, identity, or other discovered themes.

Clusters may be generated automatically but must retain explainable representative examples.

### 3.6 Pattern discovery
Compare historical creative artifacts and outcomes to identify recurring semantic patterns.

A pattern must never be presented as a proven causal relationship solely because two embeddings are similar.

## 4. Semantic object model

Every indexed object should carry:

```text
id
organization_id
project_id
object_type
source_id
content
metadata
embedding
embedding_provider
embedding_model
embedding_version
created_at
```

Optional fields:

```text
campaign_id
product_id
brand_id
performance_snapshot
language
market
channel
angle_family
confidence
source_provenance
```

## 5. Multi-tenant isolation

Semantic retrieval must always be scoped by organization and, where applicable, project.

A query must never return another organization's semantic objects.

Tenant scope is a security boundary, not merely a ranking filter.

## 6. Retrieval pipeline

```text
Query
 ↓
Normalize / classify intent
 ↓
Generate query embedding
 ↓
Apply tenant + metadata filters
 ↓
Vector similarity search
 ↓
Optional keyword / structured filters
 ↓
Re-rank candidates
 ↓
Apply confidence / freshness rules
 ↓
Return evidence + provenance
```

The result should include why each item was retrieved, its similarity score, source, and freshness where available.

## 7. Hybrid retrieval

SIEL should support hybrid retrieval rather than relying exclusively on vectors:

1. semantic similarity
2. lexical/keyword matching
3. structured metadata filters
4. recency/freshness
5. performance relevance
6. source authority

The ranking formula must be configurable and observable.

## 8. Creative Intelligence use cases

### 8.1 Product → historical winners
Given a product, find semantically similar historical creative concepts and their performance evidence.

### 8.2 Angle gap detection
Given an existing set of angles, identify semantically underrepresented buyer motivations.

### 8.3 Duplicate prevention
Before generating a new angle, compare it with existing angles and flag material semantic overlap.

### 8.4 Hook similarity
Compare a proposed hook against known hooks to detect repetitive concepts while permitting new wording when the strategic hypothesis differs.

### 8.5 Hook → landing-page continuity
Compare the semantic promise of a hook with the landing-page headline, offer, proof, and CTA to identify message disconnects.

### 8.6 Creative learning
Retrieve historical creatives that share semantic concepts with a new brief and expose their outcomes as evidence for the strategist.

## 9. Memory integration

SIEL provides semantic retrieval for ATLAS memory but does not replace the memory service.

Memory decides:

- what is worth storing
- retention policy
- scope
- confidence
- provenance
- lifecycle

SIEL decides how semantic representations are generated and retrieved.

## 10. RAG integration

SIEL is the retrieval layer for the ATLAS knowledge system.

RAG must preserve provenance. Generated answers should be able to identify the underlying documents, research records, creatives, or memories used to produce the answer.

## 11. Embedding lifecycle

Embeddings are versioned.

When the embedding model changes:

1. retain the old vector temporarily
2. create vectors using the new model
3. run retrieval/evaluation comparisons
4. migrate when quality is acceptable
5. retain migration metadata

No silent model replacement is permitted.

## 12. Languages

ATLAS is intended for multilingual e-commerce work. SIEL must support multilingual content and preserve language metadata.

Semantic search should be evaluated independently for major supported languages rather than assuming identical quality across languages.

## 13. Performance requirements

Initial target:

- common semantic retrieval requests: sub-second database retrieval target under normal load
- batch embedding generation: asynchronous
- duplicate embedding requests: cacheable/idempotent
- large ingestion: queue-based processing

Performance targets are provisional until production workload benchmarks exist.

## 14. Reliability

Embedding failure must not silently destroy the underlying source object.

The source artifact remains available even if embedding generation fails.

Failed embedding jobs must be retryable and observable.

## 15. Evaluation

SIEL requires dedicated evaluation datasets covering:

- semantic equivalence
- semantic distinction
- duplicate detection
- multilingual retrieval
- creative-angle diversity
- hook/LP continuity
- relevant historical winner retrieval

Metrics should include precision@k, recall@k, ranking quality, duplicate false-positive rate, and human usefulness ratings.

## 16. Safety and evidence discipline

Semantic similarity must never be treated as factual verification.

For example, two competitor claims may be semantically similar without either claim being true.

ATLAS must preserve source provenance and require appropriate verification before converting retrieved material into factual advertising claims.

## 17. Initial technology direction

- PostgreSQL as transactional source of truth
- pgvector for vector storage/retrieval
- Provider-neutral embedding interface
- Configurable embedding model
- Versioned embeddings
- Hybrid retrieval
- Metadata filtering
- Re-ranking boundary

The exact embedding model and vector dimension remain an implementation decision and must not be hard-coded into the architecture specification beyond migration/configuration boundaries.

## 18. Acceptance criteria

SIEL v1 is considered implemented when ATLAS can:

1. create a versioned embedding for an approved semantic object;
2. store it with tenant and provenance metadata;
3. retrieve semantically related objects within the correct tenant scope;
4. return similarity and provenance metadata;
5. identify materially similar creative hypotheses;
6. support hybrid filtering;
7. integrate retrieval into agent execution;
8. evaluate retrieval quality with a repeatable benchmark;
9. re-embed objects when the embedding model changes;
10. fail safely when embedding infrastructure is unavailable.

## 19. Non-goals

SIEL does not:

- replace the reasoning model;
- prove factual claims;
- decide campaign strategy by itself;
- guarantee that semantic similarity means commercial similarity;
- replace human review for consequential advertising claims.

## 20. Future expansion

Potential future capabilities include:

- Creative Concept Graph
- semantic campaign timelines
- buyer-motivation graphs
- cross-market concept transfer
- automated creative fatigue detection
- semantic trend detection
- outcome-weighted similarity
- multimodal image/video embeddings
- creative-to-performance concept maps
