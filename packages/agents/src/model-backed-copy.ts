import type { AgentDefinition, AgentResult } from "@atlas/agent-runtime";
import type { ExecutionEnvelope } from "@atlas/contracts";
import type { ModelProvider } from "@atlas/model-gateway";

export type CreativeCopyMode = "hooks" | "script";
export interface ModelBackedCreativeCopyOptions {
  provider: ModelProvider;
  model: string;
  mode: CreativeCopyMode;
}

function parseJson(raw: string): Record<string, unknown> {
  let parsed: unknown;
  try { parsed = JSON.parse(raw.trim()); } catch { throw new Error("MODEL_COPY_INVALID_JSON"); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("MODEL_COPY_INVALID_SHAPE");
  return parsed as Record<string, unknown>;
}

function validateHooks(value: Record<string, unknown>) {
  if (!Array.isArray(value.hooks) || value.hooks.length < 5) throw new Error("MODEL_COPY_HOOKS_REQUIRED");
  const hooks = value.hooks.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("MODEL_COPY_HOOK_INVALID");
    const item = entry as Record<string, unknown>;
    if (typeof item.text !== "string" || !item.text.trim() || typeof item.angle !== "string" || !item.angle.trim() || typeof item.rationale !== "string" || !item.rationale.trim()) throw new Error("MODEL_COPY_HOOK_INVALID");
    return { text: item.text.trim(), angle: item.angle.trim(), rationale: item.rationale.trim() };
  });
  return { hooks };
}

function validateScript(value: Record<string, unknown>) {
  if (typeof value.format !== "string" || !value.format.trim() || typeof value.durationSeconds !== "number" || value.durationSeconds <= 0 || !Array.isArray(value.scenes) || value.scenes.length < 3 || typeof value.cta !== "string" || !value.cta.trim()) throw new Error("MODEL_COPY_SCRIPT_REQUIRED_FIELDS_MISSING");
  const scenes = value.scenes.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("MODEL_COPY_SCENE_INVALID");
    const item = entry as Record<string, unknown>;
    if (typeof item.time !== "string" || !item.time.trim() || typeof item.visual !== "string" || !item.visual.trim() || typeof item.voiceover !== "string" || !item.voiceover.trim() || typeof item.onScreenText !== "string" || !item.onScreenText.trim()) throw new Error("MODEL_COPY_SCENE_INVALID");
    return { time: item.time.trim(), visual: item.visual.trim(), voiceover: item.voiceover.trim(), onScreenText: item.onScreenText.trim() };
  });
  return { format: value.format.trim(), durationSeconds: value.durationSeconds, scenes, cta: value.cta.trim() };
}

export function createModelBackedCreativeCopyAgent(options: ModelBackedCreativeCopyOptions): AgentDefinition {
  if (!options.model.trim()) throw new Error("MODEL_NAME_REQUIRED");
  const hooksMode = options.mode === "hooks";
  return {
    identity: { agentId: hooksMode ? "creative-hooks-ai" : "creative-script-ai", version: "1.0.0", domain: "copy" },
    riskLevel: "medium",
    allowedTools: [],
    async execute(input: ExecutionEnvelope): Promise<AgentResult> {
      try {
        const schema = hooksMode
          ? '{"hooks":[{"text":"string","angle":"string","rationale":"string"}]} with at least five distinct hooks'
          : '{"format":"string","durationSeconds":30,"scenes":[{"time":"0-3s","visual":"string","voiceover":"string","onScreenText":"string"},{"time":"3-10s","visual":"string","voiceover":"string","onScreenText":"string"},{"time":"10-20s","visual":"string","voiceover":"string","onScreenText":"string"}],"cta":"string"} with at least three scenes';
        const response = await options.provider.generate({
          model: options.model,
          system: [
            "You are an ATLAS direct-response creative copy agent.",
            "Use only claims supported by the supplied product brief and strategy.",
            "Never invent testimonials, statistics, certifications, guarantees, or product capabilities.",
            "If proof is missing, use demonstrable product details and flag missing proof.",
            "Return valid JSON only using this shape: " + schema,
          ].join("\n"),
          input: [
            "Task objective:", input.task.objective,
            "Product brief:", JSON.stringify(input.inputs.productBrief ?? input.inputs.product ?? input.inputs, null, 2),
            "Strategy context:", JSON.stringify(input.inputs.strategy ?? {}, null, 2),
            "Constraints:", ...input.task.constraints.map((item) => "- " + item),
          ].join("\n"),
          maxTokens: hooksMode ? 1200 : 1800,
          temperature: 0.5,
        });
        const parsed = parseJson(response.text);
        const copy = hooksMode ? validateHooks(parsed) : validateScript(parsed);
        return {
          status: "needs_review",
          result: {
            mode: options.mode,
            copy,
            model: { provider: response.provider, model: response.model, ...(response.usage ? { usage: response.usage } : {}) },
            reviewRequired: true,
          },
          warnings: ["HUMAN_REVIEW_REQUIRED: verify factual claims, brand voice, and platform compliance before use."],
        };
      } catch (error) {
        return {
          status: "needs_review",
          result: { mode: options.mode, copy: null, reviewRequired: true },
          warnings: [error instanceof Error ? error.message : "MODEL_COPY_GENERATION_FAILED", "AI_COPY_NOT_APPROVED: no publishing or paid execution is authorized."],
        };
      }
    },
  };
}
