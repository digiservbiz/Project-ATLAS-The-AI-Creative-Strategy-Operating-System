import {
  deterministicScenarioInput,
  persistVerticalSliceResult,
  runDeterministicScenario,
  validateArtifactChain,
  type ProductInput,
  type ScenarioOverrides,
  type VerticalSliceResult,
} from "@atlas/vertical-slice";
import { InMemoryArtifactRepository } from "@atlas/persistence";
import { InMemoryWorkflowRunStore, type WorkflowRunRecord } from "@atlas/workflow-engine";

export interface DemoRunSummary {
  runId: string;
  status: VerticalSliceResult["status"];
  stages: VerticalSliceResult["stages"];
  artifactCount: number;
  persistedArtifactCount: number;
  workflow: WorkflowRunRecord;
  nextActions: VerticalSliceResult["nextActions"];
  failures: VerticalSliceResult["failures"];
}

export interface DemoRun {
  result: VerticalSliceResult;
  summary: DemoRunSummary;
  artifactRepository: InMemoryArtifactRepository;
  workflowStore: InMemoryWorkflowRunStore;
}

export async function runDemo(
  product: ProductInput = deterministicScenarioInput,
  overrides: ScenarioOverrides = {},
): Promise<DemoRun> {
  const result = runDeterministicScenario(product, overrides);
  validateArtifactChain(result.artifacts);

  const artifactRepository = new InMemoryArtifactRepository();
  const persistedArtifacts = await persistVerticalSliceResult(result, artifactRepository);

  const workflowStore = new InMemoryWorkflowRunStore();
  const now = new Date().toISOString();
  const workflow: WorkflowRunRecord = {
    runId: result.runId,
    organizationId: product.organizationId,
    projectId: product.projectId,
    status: result.status,
    completedSteps: result.stages,
    outputs: {
      product: { status: "completed", result: result.product, warnings: [] },
      strategy: { status: "completed", result: result.strategy, warnings: [] },
      intelligence: { status: "completed", result: result.intelligence, warnings: [] },
      orchestrator: { status: "completed", result: result.execution, warnings: [] },
      execution: { status: "completed", result: result.execution, warnings: [] },
      performance: { status: "completed", result: result.performance, warnings: [] },
      learning: { status: "completed", result: result.learning, warnings: [] },
      "next-action": {
        status: result.status === "failed" ? "failed" : result.status === "needs_review" ? "needs_review" : "completed",
        result: { actions: result.nextActions },
        warnings: result.failures.filter((failure) => failure.stage === "next-action").map((failure) => failure.message),
      },
    },
    createdAt: now,
    updatedAt: now,
  };

  await workflowStore.create(workflow);

  return {
    result,
    summary: {
      runId: result.runId,
      status: result.status,
      stages: result.stages,
      artifactCount: result.artifacts.length,
      persistedArtifactCount: persistedArtifacts.length,
      workflow,
      nextActions: result.nextActions,
      failures: result.failures,
    },
    artifactRepository,
    workflowStore,
  };
}

export async function getPersistedDemoRun(run: DemoRun): Promise<WorkflowRunRecord | null> {
  return run.workflowStore.get(run.summary.runId, {
    organizationId: run.result.product.organizationId,
    projectId: run.result.product.projectId,
  });
}
