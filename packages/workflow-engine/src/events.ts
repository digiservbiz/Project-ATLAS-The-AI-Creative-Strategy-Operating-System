import type { WorkflowEvent, WorkflowEventType } from "@atlas/contracts";
import { workflowEventSchema } from "@atlas/contracts";
import { Database } from "@atlas/database";

export interface WorkflowEventStore { append(event: WorkflowEvent): Promise<void>; list(runId: string, scope: { organizationId: string; projectId: string }): Promise<WorkflowEvent[]>; }

export class InMemoryWorkflowEventStore implements WorkflowEventStore {
  private readonly events: WorkflowEvent[] = [];
  async append(event: WorkflowEvent): Promise<void> { const parsed = workflowEventSchema.parse(event); if (this.events.some((e) => e.eventId === parsed.eventId)) throw new Error("WORKFLOW_EVENT_ALREADY_EXISTS"); this.events.push(parsed); }
  async list(runId: string, scope: { organizationId: string; projectId: string }): Promise<WorkflowEvent[]> { return this.events.filter((e) => e.runId === runId && e.organizationId === scope.organizationId && e.projectId === scope.projectId); }
}

export class PgWorkflowEventStore implements WorkflowEventStore {
  constructor(private readonly db: Database) {}
  async append(event: WorkflowEvent): Promise<void> {
    const parsed = workflowEventSchema.parse(event);
    await this.db.query("INSERT INTO atlas_workflow_events (event_id, run_id, organization_id, project_id, step_id, event_type, attempt, payload, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::timestamptz)", [parsed.eventId, parsed.runId, parsed.organizationId, parsed.projectId, parsed.stepId, parsed.type, parsed.attempt, JSON.stringify(parsed.payload), parsed.createdAt]);
  }
  async list(runId: string, scope: { organizationId: string; projectId: string }): Promise<WorkflowEvent[]> {
    const rows = await this.db.query<any>("SELECT event_id, run_id, organization_id, project_id, step_id, event_type, attempt, payload, created_at FROM atlas_workflow_events WHERE run_id=$1 AND organization_id=$2 AND project_id=$3 ORDER BY created_at ASC, event_id ASC", [runId, scope.organizationId, scope.projectId]);
    return rows.map((row) => workflowEventSchema.parse({ eventId: row.event_id, runId: row.run_id, organizationId: row.organization_id, projectId: row.project_id, stepId: row.step_id, type: row.event_type, attempt: row.attempt, payload: row.payload ?? {}, createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at) }));
  }
}

export function event(runId: string, organizationId: string, projectId: string, type: WorkflowEventType, stepId: string | null = null, attempt: number | null = null, payload: Record<string, unknown> = {}): WorkflowEvent {
  return { eventId: runId + ":" + type + ":" + (stepId ?? "run") + ":" + (attempt ?? 0) + ":" + Date.now(), runId, organizationId, projectId, stepId, type, attempt, payload, createdAt: new Date().toISOString() };
}