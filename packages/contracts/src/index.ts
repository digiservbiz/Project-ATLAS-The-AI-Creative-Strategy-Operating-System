import { z } from "zod";

export const executionStatusSchema = z.enum([
  "queued",
  "running",
  "completed",
  "needs_review",
  "blocked",
  "failed",
  "cancelled",
]);

export const riskLevelSchema = z.enum(["low", "medium", "high"]);

export const agentIdentitySchema = z.object({
  agentId: z.string().min(1),
  version: z.string().min(1),
  domain: z.string().min(1),
});

export const executionEnvelopeSchema = z.object({
  execution: z.object({
    runId: z.string().min(1),
    workflowRunId: z.string().min(1).optional(),
    agentId: z.string().min(1),
    agentVersion: z.string().min(1),
    attempt: z.number().int().positive(),
    requestedAt: z.string().datetime(),
  }),
  context: z.object({
    organizationId: z.string().min(1),
    projectId: z.string().min(1),
    brandId: z.string().min(1).optional(),
    campaignId: z.string().min(1).optional(),
  }),
  task: z.object({
    objective: z.string().min(1),
    constraints: z.array(z.string()).default([]),
    instructions: z.array(z.string()).default([]),
  }),
  inputs: z.record(z.string(), z.unknown()),
  knowledge: z.array(z.record(z.string(), z.unknown())).default([]),
  memory: z.array(z.record(z.string(), z.unknown())).default([]),
  tools: z.array(z.string()).default([]),
});

export const artifactEnvelopeSchema = z.object({
  artifactType: z.string().min(1),
  title: z.string().min(1),
  version: z.number().int().positive(),
  content: z.record(z.string(), z.unknown()),
});

export type ExecutionStatus = z.infer<typeof executionStatusSchema>;
export type RiskLevel = z.infer<typeof riskLevelSchema>;
export type AgentIdentity = z.infer<typeof agentIdentitySchema>;
export type ExecutionEnvelope = z.infer<typeof executionEnvelopeSchema>;
export type ArtifactEnvelope = z.infer<typeof artifactEnvelopeSchema>;

export * from "./ccie";
export * from "./intelligence";
export * from "./production-readiness";
