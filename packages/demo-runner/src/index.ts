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
import type { WorkflowRunRecord } from "@atlas/workflow-engine";
import { persistDemoWorkflow } from "./workflow.js";

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
  workflowStore: Awaited<ReturnType<typeof persistDemoWorkflow>>["store"];
}

export async function runDemo(
  product: ProductInput = deterministicScenarioInput,
  overrides: ScenarioOverrides = {},
): Promise<DemoRun> {
  const result = runDeterministicScenario(product, overrides);
  validateArtifactChain(result.artifacts);
  const artifactRepository = new InMemoryArtifactRepository();
  const persistedArtifacts = await persistVerticalSliceResult(result, artifactRepository);
  const durableWorkflow = await persistDemoWorkflow(result);

  return {
    result,
    summary: {
      runId: result.runId,
      status: result.status,
      stages: result.stages,
      artifactCount: result.artifacts.length,
      persistedArtifactCount: persistedArtifacts.length,
      workflow: durableWorkflow.record,
      nextActions: result.nextActions,
      failures: result.failures,
    },
    artifactRepository,
    workflowStore: durableWorkflow.store,
  };
}

export async function getPersistedDemoRun(run: DemoRun): Promise<WorkflowRunRecord | null> {
  return run.workflowStore.get(run.summary.runId, {
    organizationId: run.result.product.organizationId,
    projectId: run.result.product.projectId,
  });
}

export * from "./workflow.js";
