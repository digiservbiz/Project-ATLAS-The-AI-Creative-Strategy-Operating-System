# ATLAS AI — Knowledge and RAG Specification

**Version:** 1.0.0  
**Status:** Foundation  
**Branch:** `dev`

## 1. Purpose

The Knowledge system provides agents with relevant domain, brand, product, and project information at execution time. Retrieval-Augmented Generation (RAG) is used to ground agent outputs in approved sources rather than relying only on model pretraining.

## 2. Knowledge Layers

ATLAS uses four conceptual layers:

### System Knowledge

Reusable knowledge shipped with ATLAS, such as marketing frameworks, copywriting principles, and creative strategy methodology.

### Organization Knowledge

Knowledge shared by an organization.

### Project Knowledge

Knowledge specific to a project.

### Brand Knowledge

Knowledge describing a brand, product, customer, and approved messaging.

More specific layers should take precedence when appropriate.

## 3. Source Types

Supported conceptual sources:

- Markdown.
- PDF/text documents.
- Web pages.
- Notion pages.
- User-provided notes.
- Product information.
- Campaign artifacts.
- Performance reports.
- Integration data.

## 4. Ingestion Pipeline

```text
Source
 ↓
Fetch / Upload
 ↓
Validate
 ↓
Normalize
 ↓
Extract metadata
 ↓
Chunk
 ↓
Generate embeddings
 ↓
Store source + chunks
 ↓
Index
 ↓
Available for retrieval
```

Ingestion must be idempotent where possible.

## 5. Chunking

Chunks should preserve semantic coherence.

Avoid arbitrary fixed-size splitting when headings, paragraphs, tables, or document structure provide better boundaries.

Each chunk should retain:

- Source ID.
- Chunk index.
- Heading/path.
- Source location.
- Content.
- Metadata.

## 6. Metadata

Recommended metadata:

```json
{
  "source_type": "document",
  "title": "Creative Testing Framework",
  "language": "en",
  "topic": "creative-testing",
  "scope": "system",
  "version": "1.0",
  "updated_at": "ISO-8601"
}
```

## 7. Retrieval Strategy

ATLAS should use hybrid retrieval:

1. Metadata filtering.
2. Keyword/full-text retrieval.
3. Vector similarity.
4. Optional reranking.

The retrieval pipeline should prioritize relevance over returning a large number of chunks.

## 8. Retrieval Context

The agent receives a compact evidence package:

```text
Source: Creative Testing Framework
Section: Hook Testing
Relevance: high
Content: ...
```

Each result should have a stable source reference.

## 9. Query Construction

Queries should be derived from the agent's actual task.

For example, a Hook Generator should retrieve:

- Product benefits.
- Customer pain points.
- Approved positioning.
- Historical winning hooks.
- Relevant copywriting frameworks.

It should not retrieve the entire knowledge base.

## 10. Grounding Rules

Agents must distinguish between:

- Retrieved evidence.
- User-provided facts.
- Model-generated recommendations.
- Inferences.

A retrieved document should not automatically be treated as correct if it conflicts with newer project evidence.

## 11. Source Priority

Initial priority order:

1. Explicit current user/project input.
2. Approved brand knowledge.
3. Recent measured campaign evidence.
4. Project knowledge.
5. Organization knowledge.
6. System knowledge.
7. General model knowledge.

This is a decision guideline, not a universal truth. The agent must resolve conflicts based on context.

## 12. Knowledge Versioning

Sources may change over time.

Store:

- Source checksum.
- Version.
- Ingestion timestamp.
- Previous source relationship.

Never silently rewrite historical evidence used by a past campaign.

## 13. Knowledge Quality

Knowledge ingestion should support:

- Duplicate detection.
- Source validation.
- Language detection.
- Metadata validation.
- Broken-source detection.
- Re-ingestion.

## 14. Access Control

Retrieval must enforce scope.

A user working in Organization A must never retrieve private knowledge from Organization B.

Project-specific knowledge should only be returned when the requesting context has access to that project.

## 15. Embeddings

The embedding provider must be abstracted behind an internal interface.

Conceptual interface:

```text
EmbeddingService.embed(text)
EmbeddingService.embedBatch(texts)
```

The embedding model/version must be recorded so re-indexing can occur when necessary.

## 16. Vector Storage

Initial implementation: PostgreSQL + pgvector.

A dedicated vector database should only be introduced after measured scale or retrieval requirements justify it.

## 17. RAG Evaluation

RAG quality should be evaluated separately from generation quality.

Metrics include:

- Retrieval relevance.
- Recall of required evidence.
- Citation/source accuracy.
- Context sufficiency.
- Irrelevant context rate.
- Groundedness.

## 18. Hallucination Control

RAG does not eliminate hallucinations.

Agents should be instructed:

- Do not invent sources.
- Do not invent customer evidence.
- Mark uncertainty.
- Ask for missing information when necessary.
- Preserve source references for research claims.

## 19. Knowledge Packs

ATLAS should eventually support installable knowledge packs.

Example:

```text
knowledge-packs/
  ecommerce/
  meta-ads/
  direct-response/
  ugc/
  cro/
  beauty/
  fashion/
  saas/
```

A knowledge pack should contain versioned content plus metadata describing applicability.

## 20. MVP

The first RAG implementation should support:

- Markdown ingestion.
- Manual document ingestion.
- PostgreSQL/pgvector storage.
- Metadata filtering.
- Semantic retrieval.
- Source references.
- Agent-specific retrieval.

External connectors can follow after the core pipeline works.

## 21. Acceptance Criteria

The knowledge system is ready when:

- A document can be ingested.
- Chunks and metadata are persisted.
- Embeddings are generated through an abstraction.
- Relevant chunks can be retrieved by an agent task.
- Tenant boundaries are enforced.
- Sources can be traced from generated outputs.
- Re-ingestion does not create uncontrolled duplicates.

---

**Next:** Workflow Engine Specification.
