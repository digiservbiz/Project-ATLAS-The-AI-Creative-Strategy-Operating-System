import { randomUUID } from "node:crypto";
import { AgentRegistry, AgentRuntime } from "@atlas/agent-runtime";
import { createModelBackedCreativeStrategyAgent } from "@atlas/agents";
import type { ExecutionEnvelope } from "@atlas/contracts";
import { AnthropicProvider } from "@atlas/model-gateway";

export interface StrategyGenerationInput {
  organizationId: string;
  projectId: string;
  productBrief: Record<string, unknown> | string;
  objective?: string;
  constraints?: string[];
}

export interface StrategyServiceConfig {
  apiKey: string;
  model: string;
}

export async function generateStrategy(
  input: StrategyGenerationInput,
  config: StrategyServiceConfig,
) {
  if (!input.organizationId?.trim() || !input.projectId?.trim()) {
    throw new Error("TENANT_SCOPE_REQUIRED");
  }
  if (
    !input.productBrief ||
    (typeof input.productBrief !== "string" && (
      typeof input.productBrief !== "object" || Array.isArray(input.productBrief)
    ))
  ) {
    throw new Error("PRODUCT_BRIEF_REQUIRED");
  }
  if (typeof input.productBrief === "string" && !input.productBrief.trim()) {
    throw new Error("PRODUCT_BRIEF_REQUIRED");
  }
  if (!config.apiKey.trim()) throw new Error("ANTHROPIC_API_KEY is required");
  if (!config.model.trim()) throw new Error("ANTHROPIC_MODEL is required");

  const registry = new AgentRegistry();
  const provider = new AnthropicProvider(config.apiKey);
  registry.register(createModelBackedCreativeStrategyAgent({ provider, model: config.model }));
  const runtime = new AgentRuntime(registry);

  const envelope: ExecutionEnvelope = {
    execution: {
      runId: `strategy:${randomUUID()}`,
      agentId: "creative-strategy-ai",
      agentVersion: "1.0.0",
      attempt: 1,
      requestedAt: new Date().toISOString(),
    },
    context: {
      organizationId: input.organizationId,
      projectId: input.projectId,
    },
    task: {
      objective: input.objective?.trim() || "Develop a differentiated, evidence-conscious creative strategy.",
      constraints: input.constraints ?? [
        "Do not invent product claims, testimonials, certifications, or performance results.",
        "Identify proof requirements for claims that need substantiation.",
        "Produce distinct creative angles suitable for human review.",
      ],
      instructions: [],
    },
    inputs: { productBrief: input.productBrief },
    knowledge: [],
    memory: [],
    tools: [],
  };

  return runtime.execute(envelope);
}
