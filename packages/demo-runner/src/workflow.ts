import type { AgentResult, AgentRuntime } from "@atlas/agent-runtime";
import type { ExecutionEnvelope } from "@atlas/contracts";
import {
  InMemoryWorkflowRunStore,
  WorkflowEngine,
  type WorkflowStep,
  type WorkflowRunRecord,
} from "@atlas/workflow-engine";
import type { SliceStage, VerticalSliceResult } from "@atlas/vertical-slice";

function envelope(
  runId: string,
  organizationId: string,
  projectId: string,
  stage: SliceStage,
  result: Record<string, unknown>,
): ExecutionEnvelope {
  return {
    execution: {
      runId,
      agentId: `demo-${stage}`,
      agentVersion: "1.0.0",
    },
    context: { organizationId, projectId },
    input: result,
    tools: [],
  };
}

function runtimeFor(result: VerticalSliceResult): AgentRuntime {
  const registry = new (require("@atlas/agent-runtime").AgentRegistry)();
  return registry as AgentRuntime;
}

export interface DurableDemoWorkflow {
  store: InMemoryWorkflowRunStore;
  record: WorkflowRunRecord;
}

export async function persistDemoWorkflow(
  result: VerticalSliceResult,
): Promise<DurableDemoWorkflow> {
  const store = new InMemoryWorkflowRunStore();
  const now = new Date().toISOString();
  const record: WorkflowRunRecord = {
    runId: result.runId,
    organizationId: result.product.organizationId,
    projectId: result.product.projectId,
    status: result.status,
    completedSteps: result.stages,
    outputs: Object.fromEntries(
      result.stages.map((stage) => [
        stage,
        {
          status: "completed",
          result: stage === "product" ? result.product
            : stage === "strategy" ? result.strategy
            : stage === "intelligence-decision" ? result.intelligence
            : stage === "orchestrator" || stage === "execution" ? result.execution
            : stage === "performance" ? result.performance
            : stage === "learning" ? result.learning
            : { actions: result.nextActions },
          warnings: result.failures.filter((f) => f.stage === stage).map((f) => f.message),
        } satisfies AgentResult,
      ]),
    ),
    createdAt: now,
    updatedAt: now,
  };
  await store.create(record);
  return { store, record };
}
