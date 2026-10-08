import { AgentRegistry, AgentRuntime, type AgentDefinition, type AgentResult } from "@atlas/agent-runtime";
import type { ExecutionEnvelope, WorkflowArtifactHandoff } from "@atlas/contracts";
import { InMemoryWorkflowRunStore, WorkflowEngine, type WorkflowStep, type WorkflowRunRecord } from "@atlas/workflow-engine";
import type { SliceStage, StageArtifact, VerticalSliceResult } from "@atlas/vertical-slice";

function envelope(
  runId: string,
  organizationId: string,
  projectId: string,
  stage: SliceStage,
  result: Record<string, unknown>,
  previousArtifact?: StageArtifact,
): ExecutionEnvelope {
  return {
    execution: {
      runId,
      agentId: "demo-" + stage,
      agentVersion: "1.0.0",
      attempt: 1,
      requestedAt: "2026-01-15T00:00:00.000Z",
    },
    context: { organizationId, projectId },
    task: {
      objective: "Execute ATLAS deterministic stage: " + stage,
      constraints: [],
      instructions: previousArtifact
        ? ["Consume the previous stage artifact before producing this stage output."]
        : ["Initialize the workflow from the supplied product input."],
    },
    inputs: { stageInput: result },
    knowledge: [],
    memory: [],
    tools: [],
  };
}

function resultFor(result: VerticalSliceResult, stage: SliceStage): AgentResult {
  const value =
    stage === "product" ? result.product :
    stage === "strategy" ? result.strategy :
    stage === "intelligence-decision" ? result.intelligence :
    stage === "orchestrator" || stage === "execution" ? result.execution :
    stage === "performance" ? result.performance :
    stage === "learning" ? result.learning :
    { actions: result.nextActions };

  return {
    status: result.status === "failed" ? "failed" : result.status === "needs_review" && stage === "next-action" ? "needs_review" : "completed",
    result: value as Record<string, unknown>,
    warnings: result.failures.filter((failure) => failure.stage === stage).map((failure) => failure.message),
  };
}

function buildRuntime(result: VerticalSliceResult): AgentRuntime {
  const registry = new AgentRegistry();

  for (const stage of result.stages) {
    const definition: AgentDefinition = {
      identity: {
        agentId: "demo-" + stage,
        version: "1.0.0",
        domain: "atlas-demo",
      },
      riskLevel: stage === "execution" ? "high" : "low",
      allowedTools: [],
      execute: async (input) => {
        if (stage !== "product") {
          const handoff = input.inputs.artifactHandoff;
          if (!handoff || typeof handoff !== "object") {
            return {
              status: "blocked",
              result: {},
              warnings: ["ARTIFACT_HANDOFF_REQUIRED"],
            };
          }
          const source = handoff as Record<string, unknown>;
          if (typeof source.sourceArtifactId !== "string" || typeof source.sourceStage !== "string" || typeof source.sourceArtifactType !== "string" || !source.payload || typeof source.payload !== "object") {
            return {
              status: "blocked",
              result: {},
              warnings: ["ARTIFACT_HANDOFF_INVALID"],
            };
          }
          if (source.sourceStage !== result.stages[result.stages.indexOf(stage) - 1]) {
            return { status: "blocked", result: {}, warnings: ["ARTIFACT_HANDOFF_UPSTREAM_STAGE_MISMATCH"] };
          }
          if (input.context.organizationId !== result.product.organizationId || input.context.projectId !== result.product.projectId) {
            return {
              status: "blocked",
              result: {},
              warnings: ["ARTIFACT_HANDOFF_SCOPE_MISMATCH"],
            };
          }
        }
        return resultFor(result, stage);
      },
    };
    registry.register(definition);
  }

  return new AgentRuntime(registry);
}

export function buildDemoWorkflowSteps(result: VerticalSliceResult): WorkflowStep[] {
  return result.stages.map((stage, index) => {
    const previousArtifact = index > 0 ? result.artifacts[index - 1] : undefined;
    return {
      stepId: stage,
      agentId: "demo-" + stage,
      agentVersion: "1.0.0",
      input: envelope(
        result.runId,
        result.product.organizationId,
        result.product.projectId,
        stage,
        resultFor(result, stage).result,
        previousArtifact,
      ),
      ...(previousArtifact
        ? {
            artifactHandoff: {
              sourceArtifactId: previousArtifact.artifactId,
              sourceStage: previousArtifact.stage,
              sourceArtifactType: previousArtifact.artifactType,
              payload: previousArtifact.payload,
            } satisfies WorkflowArtifactHandoff,
            requiresArtifactHandoff: true,
          }
        : {}),
    };
  });
}

export interface DurableDemoWorkflow {
  store: InMemoryWorkflowRunStore;
  record: WorkflowRunRecord;
}

export async function persistDemoWorkflow(result: VerticalSliceResult): Promise<DurableDemoWorkflow> {
  const store = new InMemoryWorkflowRunStore();
  const runtime = buildRuntime(result);
  const steps = buildDemoWorkflowSteps(result);

  const workflowResult = await new WorkflowEngine(runtime, store).run(steps);
  const scope = {
    organizationId: result.product.organizationId,
    projectId: result.product.projectId,
  };

  const record = await store.get(result.runId, scope);
  if (!record) throw new Error("DEMO_WORKFLOW_NOT_PERSISTED");

  if (workflowResult.status === "completed" && result.status === "needs_review") {
    await store.update(result.runId, scope, {
      status: "needs_review",
      completedSteps: workflowResult.completedSteps,
      outputs: workflowResult.outputs,
    });
  }

  const finalRecord = await store.get(result.runId, scope);
  if (!finalRecord) throw new Error("DEMO_WORKFLOW_NOT_PERSISTED");

  return { store, record: finalRecord };
}
