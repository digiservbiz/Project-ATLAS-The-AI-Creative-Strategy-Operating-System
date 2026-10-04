import type { WorkflowEvent } from "@atlas/contracts";

export interface WorkflowEventStore {
  append(event: WorkflowEvent): Promise<void>;
  list(runId: string, scope: { organizationId: string; projectId: string }): Promise<WorkflowEvent[]>;
}

export class InMemoryWorkflowEventStore implements WorkflowEventStore {
  private readonly events: WorkflowEvent[] = [];
  async append(event: WorkflowEvent): Promise<void> {
    if (this.events.some((e) => e.eventId === event.eventId)) throw new Error("WORKFLOW_EVENT_ALREADY_EXISTS");
    this.events.push(event);
  }
  async list(runId: string, scope: { organizationId: string; projectId: string }): Promise<WorkflowEvent[]> {
    return this.events.filter((e) => e.runId === runId && e.organizationId === scope.organizationId && e.projectId === scope.projectId);
  }
}
