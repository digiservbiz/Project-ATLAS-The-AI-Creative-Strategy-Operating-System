import type { AgentDefinition, AgentResult } from "@atlas/agent-runtime";
import type { ExecutionEnvelope } from "@atlas/contracts";
import type { ModelProvider } from "@atlas/model-gateway";

export interface ModelBackedStrategyOptions {
  provider: ModelProvider;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

interface CreativeStrategyOutput {
  primaryAngle: string;
  messageContinuity: string;
  proofFirst: boolean;
  angles: Array<{ name: string; premise: string }>;
}

function parseStrategyOutput(raw: string): CreativeStrategyOutput {
  const normalized = raw.trim().replace(/^\x60\x60\x60(?:json)?\s*/i, "").replace(/\s*\x60\x60\x60$/, "");
  let value: unknown;
  try {
    value = JSON.parse(normalized);
  } catch {
    throw new Error("MODEL_STRATEGY_INVALID_JSON");
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("MODEL_STRATEGY_INVALID_SHAPE");
  }
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.primaryAngle !== "string" || !candidate.primaryAngle.trim() ||
    typeof candidate.messageContinuity !== "string" || !candidate.messageContinuity.trim() ||
    typeof candidate.proofFirst !== "boolean" ||
    !Array.isArray(candidate.angles) || candidate.angles.length < 3
  ) {
    throw new Error("MODEL_STRATEGY_REQUIRED_FIELDS_MISSING");
  }

  const angles = candidate.angles.map((angle) => {
    if (!angle || typeof angle !== "object" || Array.isArray(angle)) {
      throw new Error("MODEL_STRATEGY_ANGLE_INVALID");
    }
    const item = angle as Record<string, unknown>;
    if (typeof item.name !== "string" || !item.name.trim() ||
        typeof item.premise !== "string" || !item.premise.trim()) {
      throw new Error("MODEL_STRATEGY_ANGLE_INVALID");
    }
    return { name: item.name.trim(), premise: item.premise.trim() };
  });

  return {
    primaryAngle: candidate.primaryAngle.trim(),
    messageContinuity: candidate.messageContinuity.trim(),
    proofFirst: candidate.proofFirst,
    angles,
  };
}

function productBrief(input: ExecutionEnvelope): string {
  const supplied = input.inputs.productBrief ?? input.inputs.product ?? input.inputs;
  return typeof supplied === "string" ? supplied : JSON.stringify(supplied, null, 2);
}

/**
 * Creates a real model-backed strategy agent.
 * Provider and model selection are explicit; no implicit provider fallback exists.
 */
export function createModelBackedCreativeStrategyAgent(
  options: ModelBackedStrategyOptions,
): AgentDefinition {
  if (!options.model.trim()) throw new Error("MODEL_NAME_REQUIRED");

  return {
    identity: {
      agentId: "creative-strategy-ai",
      version: "1.0.0",
      domain: "strategy",
    },
    riskLevel: "medium",
    allowedTools: [],
    async execute(input): Promise<AgentResult> {
      try {
        const response = await options.provider.generate({
          model: options.model,
          system: [
            "You are the ATLAS creative strategy agent.",
            "Develop evidence-conscious advertising strategy from the supplied product brief.",
            "Never invent customer testimonials, performance results, certifications, or product claims.",
            "Return only valid JSON with this shape:",
            '{"primaryAngle":"string","messageContinuity":"string","proofFirst":true,"angles":[{"name":"string","premise":"string"},{"name":"string","premise":"string"},{"name":"string","premise":"string"}]}',
            "Provide at least three meaningfully different angles. State proof requirements when claims need substantiation.",
          ].join("\n"),
          input: [
            "Workflow objective:",
            input.task.objective,
            "Product and project brief:",
            productBrief(input),
            "Constraints:",
            ...input.task.constraints.map((constraint) => `- ${constraint}`),
          ].join("\n"),
          maxTokens: options.maxTokens ?? 1400,
          temperature: options.temperature ?? 0.3,
        });

        const strategy = parseStrategyOutput(response.text);
        return {
          status: "needs_review",
          result: {
            strategy,
            model: { provider: response.provider, model: response.model, usage: response.usage },
            reviewRequired: true,
          },
          warnings: ["HUMAN_REVIEW_REQUIRED: verify claims, audience fit, and proof before execution."],
        };
      } catch (error) {
        return {
          status: "needs_review",
          result: {
            strategy: null,
            reviewRequired: true,
          },
          warnings: [
            error instanceof Error ? error.message : "MODEL_STRATEGY_GENERATION_FAILED",
            "AI_STRATEGY_NOT_APPROVED: no downstream paid execution is authorized.",
          ],
        };
      }
    },
  };
}
