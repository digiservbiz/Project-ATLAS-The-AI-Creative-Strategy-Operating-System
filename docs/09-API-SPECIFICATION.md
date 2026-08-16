# ATLAS AI — API Specification

**Version:** 1.0.0  
**Status:** Foundation  
**Branch:** `dev`

## 1. Purpose

The ATLAS API is the application boundary between the frontend, integrations, and backend services. It exposes projects, brands, campaigns, workflows, artifacts, approvals, knowledge, memory, and agent execution status.

## 2. API Principles

- REST-first for the MVP.
- JSON request/response format.
- Versioned API namespace.
- Authentication required for private resources.
- Authorization enforced server-side.
- Stable error format.
- Idempotency for retryable commands.
- Pagination for collections.

## 3. Base Path

```text
/api/v1
```

## 4. Authentication

Requests require an authenticated user for private resources.

Conceptual header:

```text
Authorization: Bearer <token>
```

The backend validates identity and resolves organization membership before accessing tenant data.

## 5. Standard Response

Successful resource response:

```json
{
  "data": {},
  "meta": {}
}
```

Collection response:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 25,
    "total": 100
  }
}
```

## 6. Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {},
    "request_id": "uuid"
  }
}
```

## 7. Health

```text
GET /health
```

Returns service health.

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

## 8. Projects

```text
GET    /projects
POST   /projects
GET    /projects/:projectId
PATCH  /projects/:projectId
DELETE /projects/:projectId
```

## 9. Brands

```text
GET    /projects/:projectId/brands
POST   /projects/:projectId/brands
GET    /brands/:brandId
PATCH  /brands/:brandId
```

## 10. Products

```text
GET    /projects/:projectId/products
POST   /projects/:projectId/products
GET    /products/:productId
PATCH  /products/:productId
```

## 11. Campaigns

```text
GET    /projects/:projectId/campaigns
POST   /projects/:projectId/campaigns
GET    /campaigns/:campaignId
PATCH  /campaigns/:campaignId
```

## 12. Workflows

List available workflows:

```text
GET /workflows
```

Create a run:

```text
POST /workflow-runs
```

Get run:

```text
GET /workflow-runs/:runId
```

Pause:

```text
POST /workflow-runs/:runId/pause
```

Resume:

```text
POST /workflow-runs/:runId/resume
```

Cancel:

```text
POST /workflow-runs/:runId/cancel
```

Retry a failed step:

```text
POST /workflow-runs/:runId/retry
```

## 13. Agent Runs

```text
GET /workflow-runs/:runId/agents
GET /agent-runs/:agentRunId
```

Direct agent execution should not be exposed to ordinary users unless explicitly authorized. Most agent execution should occur through workflows.

## 14. Artifacts

```text
GET /projects/:projectId/artifacts
GET /artifacts/:artifactId
GET /artifacts/:artifactId/versions
```

Artifacts are immutable. Editing creates a new version through an appropriate domain command.

## 15. Approvals

```text
GET  /approvals
GET  /approvals/:approvalId
POST /approvals/:approvalId/approve
POST /approvals/:approvalId/reject
POST /approvals/:approvalId/request-changes
```

Approval endpoints must verify that the requesting user has permission to make the decision.

## 16. Memory

```text
GET    /projects/:projectId/memories
POST   /projects/:projectId/memories
GET    /memories/:memoryId
PATCH  /memories/:memoryId
DELETE /memories/:memoryId
```

Automatic memory extraction should use internal services rather than allowing unrestricted client-side memory creation.

## 17. Knowledge

```text
GET  /projects/:projectId/knowledge/sources
POST /projects/:projectId/knowledge/sources
GET  /knowledge/sources/:sourceId
POST /knowledge/sources/:sourceId/reindex
DELETE /knowledge/sources/:sourceId
```

## 18. Search

```text
POST /knowledge/search
POST /memory/search
```

Search requests must inherit organization/project authorization from the authenticated context.

## 19. Agent Registry

```text
GET /agents
GET /agents/:agentId
```

The API should expose capabilities and status, not internal prompts or secrets.

## 20. Request Idempotency

Commands that may be retried should accept:

```text
Idempotency-Key: <unique-key>
```

The backend should safely return the previous result for duplicate requests where applicable.

## 21. Pagination

Collection endpoints should support:

```text
?page=1&page_size=25
```

Maximum page size must be enforced server-side.

## 22. Filtering

Filtering should use explicit documented parameters. Avoid accepting arbitrary SQL-like filter expressions.

## 23. Rate Limiting

The API should apply rate limits by authenticated organization/user and endpoint risk.

Agent execution endpoints should have stricter limits than read-only endpoints.

## 24. Security

The API must:

- Validate all inputs.
- Authorize every resource access.
- Prevent cross-tenant access.
- Avoid leaking internal errors.
- Avoid logging credentials.
- Enforce request size limits.
- Validate uploaded file types.

## 25. API Versioning

Breaking API changes require a new version namespace or documented compatibility strategy.

Initial version:

```text
/api/v1
```

## 26. First Vertical Slice Endpoints

Only implement the endpoints required for:

```text
Create Project
Create Brand
Create Product
Create Campaign
Create Workflow Run
Inspect Workflow Run
Inspect Artifacts
Review Approval
Resume Workflow
```

## 27. Definition of Done

The API foundation is ready when:

- Authenticated requests work.
- Tenant authorization works.
- Standard errors are implemented.
- Workflow runs can be created and inspected.
- Artifacts can be retrieved.
- Approvals can be resolved.
- OpenAPI documentation can be generated from the implementation.

---

**Next:** First Vertical Slice Implementation Plan.
