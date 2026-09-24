import type { ExecutionEnvelope } from "@atlas/contracts";
import type { AgentRuntime, AgentResult } from "@atlas/agent-runtime";
import { Database } from "@atlas/database";

export interface WorkflowStep {
  stepId: string;
  agentId: string;
  agentVersion: string;
  input: ExecutionEnvelope;
}

export interface WorkflowRunResult {
  status: "completed" | "needs_review" | "blocked" | "failed";
  completedSteps: string[];
  outputs: Record<string, AgentResult>;
}

export interface WorkflowRunRecord extends WorkflowRunResult {
  runId: string;
  organizationId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowRunStore {
  create(record: WorkflowRunRecord): Promise<void>;
  update(
    runId: string,
    scope: Pick<WorkflowRunRecord, "organizationId" | "projectId">,
    patch: Pick<WorkflowRunResult, "status" | "completedSteps" | "outputs">,
  ): Promise<void>;
  get(
    runId: string,
    scope: Pick<WorkflowRunRecord, "organizationId" | "projectId">,
  ): Promise<WorkflowRunRecord | null>;
}

export class InMemoryWorkflowRunStore implements WorkflowRunStore {
  private readonly data = new Map<string, WorkflowRunRecord>();

  async create(record: WorkflowRunRecord): Promise<void> {
    if (this.data.has(record.runId)) throw new Error("WORKFLOW_RUN_ALREADY_EXISTS");
    this.data.set(record.runId, record);
  }

  async update(
    runId: string,
    scope: Pick<WorkflowRunRecord, "organizationId" | "projectId">,
    patch: Pick<WorkflowRunResult, "status" | "completedSteps" | "outputs">,
  ): Promise<void> {
    const current = this.data.get(runId);
    if (!current) throw new Error("WORKFLOW_RUN_NOT_FOUND");
    if (current.organizationId !== scope.organizationId || current.projectId !== scope.projectId) {
      throw new Error("TENANT_SCOPE_VIOLATION");
    }
    this.data.set(runId, {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  }

  async get(
    runId: string,
    scope: Pick<WorkflowRunRecord, "organizationId" | "projectId">,
  ): Promise<WorkflowRunRecord | null> {
    const record = this.data.get(runId);
    if (!record) return null;
    if (record.organizationId !== scope.organizationId || record.projectId !== scope.projectId) {
      return null;
    }
    return record;
  }
}

export class PgWorkflowRunStore implements WorkflowRunStore {
  constructor(private readonly db: Database) {}

  async create(record: WorkflowRunRecord): Promise<void> {
    await this.db.query(
      `INSERT INTO atlas_workflow_runs
        (run_id, organization_id, project_id, status, completed_steps, outputs, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::timestamptz,$8::timestamptz)`,
      [
        record.runId,
        record.organizationId,
        record.projectId,
        record.status,
        JSON.stringify(record.completedSteps),
        JSON.stringify(record.outputs),
        record.createdAt,
        record.updatedAt,
      ],
    );
  }

  async update(
    runId: string,
    scope: Pick<WorkflowRunRecord, "organizationId" | "projectId">,
    patch: Pick<WorkflowRunResult, "status" | "completedSteps" | "outputs">,
  ): Promise<void> {
    const rows = await this.db.query(
      `UPDATE atlas_workflow_runs
       SET status=$1, completed_steps=$2::jsonb, outputs=$3::jsonb, updated_at=now()
       WHERE run_id=$4 AND organization_id=$5 AND project_id=$6
       RETURNING run_id`,
      [
        patch.status,
        JSON.stringify(patch.completedSteps),
        JSON.stringify(patch.outputs),
        runId,
        scope.organizationId,
        scope.projectId,
      ],
    );
    if (!rows.length) throw new Error("WORKFLOW_RUN_NOT_FOUND");
  }

  async get(
    runId: string,
    scope: Pick<WorkflowRunRecord, "organizationId" | "projectId">,
  ): Promise<WorkflowRunRecord | null> {
    const rows = await this.db.query<any>(
      `SELECT run_id, organization_id, project_id, status, completed_steps,
              outputs, created_at, updated_at
       FROM atlas_workflow_runs
       WHERE run_id=$1 AND organization_id=$2 AND project_id=$3`,
      [runId, scope.organizationId, scope.projectId],
    );
    const row = rows[0];
    if (!row) return null;

    return {
      runId: row.run_id,
      organizationId: row.organization_id,
      projectId: row.project_id,
      status: row.status,
      completedSteps: row.completed_steps ?? [],
      outputs: row.outputs ?? {},
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
    };
  }
}

export class WorkflowEngine {
  constructor(
    private readonly runtime: AgentRuntime,
    private readonly store?: WorkflowRunStore,
  ) {}

  async run(steps: readonly WorkflowStep[]): Promise<WorkflowRunResult> {
    const outputs: Record<string, AgentResult> = {};
    const completedSteps: string[] = [];

    if (!steps.length) return { status: "completed", completedSteps, outputs };

    const first = steps[0].input;
    const scope = {
      organizationId: first.context.organizationId,
      projectId: first.context.projectId,
    };
    const runId = first.execution.runId;
    const now = new Date().toISOString();

    if (this.store) {
      await this.store.create({
        runId,
        ...scope,
        status: "running",
        completedSteps: [],
        outputs: {},
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const step of steps) {
      if (
        step.input.execution.runId !== runId ||
        step.input.context.organizationId !== scope.organizationId ||
        step.input.context.projectId !== scope.projectId
      ) {
        throw new Error("WORKFLOW_SCOPE_MISMATCH");
      }

      const result = await this.runtime.execute(step.input);
      outputs[step.stepId] = result;

      if (result.status !== "completed") {
        const finalResult = { status: result.status, completedSteps, outputs };
        if (this.store) await this.store.update(runId, scope, finalResult);
        return finalResult;
      }

      completedSteps.push(step.stepId);
      if (this.store) {
        await this.store.update(runId, scope, {
          status: "running",
          completedSteps,
          outputs,
        });
      }
    }

    const finalResult = { status: "completed" as const, completedSteps, outputs };
    if (this.store) await this.store.update(runId, scope, finalResult);
    return finalResult;
  }
}
