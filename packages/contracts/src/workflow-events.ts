import { z } from "zod";

export const workflowEventTypeSchema = z.enum([
  "run_created", "step_started", "step_succeeded", "step_failed",
  "step_blocked", "run_completed", "run_needs_review", "run_failed",
]);

export const workflowEventSchema = z.object({
  eventId: z.string().min(1),
  runId: z.string().min(1),
  organizationId: z.string().min(1),
  projectId: z.string().min(1),
  stepId: z.string().min(1).nullable(),
  type: workflowEventTypeSchema,
  attempt: z.number().int().positive().nullable(),
  payload: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string().datetime(),
});

export type WorkflowEventType = z.infer<typeof workflowEventTypeSchema>;
export type WorkflowEvent = z.infer<typeof workflowEventSchema>;
