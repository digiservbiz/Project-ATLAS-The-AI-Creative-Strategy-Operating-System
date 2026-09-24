import type {
  EmbeddingProvider,
  SemanticObject,
  SemanticRepository,
  SemanticSearchResponse,
} from "@atlas/contracts";

export interface RetrievalFixture {
  name: string;
  query: string;
  expectedObjectIds: string[];
  objectTypes?: SemanticObject["objectType"][];
}

export interface RetrievalEvaluation {
  fixture: string;
  passed: boolean;
  returnedObjectIds: string[];
  expectedObjectIds: string[];
  topRankExpected: boolean;
  tenantSafe: boolean;
}

export async function evaluateRetrieval(
  provider: EmbeddingProvider,
  repository: SemanticRepository,
  fixture: RetrievalFixture,
  scope: Pick<SemanticObject, "organizationId" | "projectId">,
): Promise<RetrievalEvaluation> {
  const queryVector = await provider.embed(fixture.query);
  const response: SemanticSearchResponse = await repository.search(
    {
      organizationId: scope.organizationId,
      projectId: scope.projectId,
      query: fixture.query,
      topK: Math.max(1, fixture.expectedObjectIds.length),
      objectTypes: fixture.objectTypes ?? [],
      filters: {},
    },
    queryVector,
    provider.modelId,
  );

  const returnedObjectIds = response.results.map((result) => result.object.id);
  const expectedSet = new Set(fixture.expectedObjectIds);
  const tenantSafe = response.results.every(
    (result) =>
      result.object.organizationId === scope.organizationId
      && result.object.projectId === scope.projectId,
  );
  const topRankExpected = returnedObjectIds.length > 0
    && expectedSet.has(returnedObjectIds[0]);

  return {
    fixture: fixture.name,
    passed: tenantSafe && topRankExpected,
    returnedObjectIds,
    expectedObjectIds: fixture.expectedObjectIds,
    topRankExpected,
    tenantSafe,
  };
}

export function summarizeRetrievalEvaluations(results: RetrievalEvaluation[]) {
  return {
    total: results.length,
    passed: results.filter((result) => result.passed).length,
    failed: results.filter((result) => !result.passed).length,
    passRate: results.length ? results.filter((result) => result.passed).length / results.length : 0,
  };
}
