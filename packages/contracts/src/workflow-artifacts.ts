import { z } from "zod";

export const workflowArtifactHandoffSchema = z.object({
  sourceArtifactId: z.string().min(1),
  sourceStage: z.string().min(1),
  sourceArtifactType: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
});

export type WorkflowArtifactHandoff = z.infer<typeof workflowArtifactHandoffSchema>;

export function assertWorkflowArtifactHandoff(value: unknown): WorkflowArtifactHandoff {
  return workflowArtifactHandoffSchema.parse(value);
}
