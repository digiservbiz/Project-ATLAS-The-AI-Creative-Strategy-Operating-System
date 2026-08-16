import type { AgentDefinition, AgentResult } from "@atlas/agent-runtime";
import type { ExecutionEnvelope } from "@atlas/contracts";

function textInput(input: ExecutionEnvelope): string {
  const value = input.inputs.productBrief ?? input.inputs.product ?? input.task.objective;
  return typeof value === "string" ? value : JSON.stringify(value);
}

function result(content: Record<string, unknown>): AgentResult {
  return { status: "completed", result: content, warnings: [] };
}

export const productResearchAgent: AgentDefinition = {
  identity: { agentId: "product-research", version: "1.0.0", domain: "research" },
  riskLevel: "low",
  allowedTools: [],
  async execute(input) {
    const product = textInput(input);
    return result({
      product,
      research: {
        coreProblem: "Identify the primary customer problem from the supplied product brief.",
        benefitsToValidate: [],
        objectionsToInvestigate: [],
        proofNeeded: [],
        missingInformation: ["customer evidence", "competitor evidence", "proof assets"],
      },
    });
  },
};

export const creativeStrategyAgent: AgentDefinition = {
  identity: { agentId: "creative-strategy", version: "1.0.0", domain: "strategy" },
  riskLevel: "medium",
  allowedTools: [],
  async execute(input) {
    return result({
      strategy: {
        primaryAngle: "problem-solution",
        messageContinuity: "The promise established in the hook must remain explicit on the landing page.",
        proofFirst: true,
        angles: [
          { name: "Pain", premise: "Lead with the costly or frustrating problem." },
          { name: "Ego & Status", premise: "Connect the product to identity or desired status." },
          { name: "Gifting", premise: "Frame the product around a specific recipient and occasion." },
          { name: "Competitor", premise: "Contrast against a meaningful weakness without unsupported claims." },
        ],
        sourceBrief: input.inputs,
      },
    });
  },
};

export const angleGeneratorAgent: AgentDefinition = {
  identity: { agentId: "angle-generator", version: "1.0.0", domain: "strategy" },
  riskLevel: "low",
  allowedTools: [],
  async execute(input) {
    const families = ["Pain", "Benefit", "Proof", "Ego", "Status", "Gifting", "Competitor", "Objection", "Curiosity", "Demo"];
    const angles = Array.from({ length: 20 }, (_, index) => ({
      id: index + 1,
      family: families[index % families.length],
      hypothesis: `Test angle ${index + 1} against a distinct buyer motivation.`,
    }));
    return result({ angles, productBrief: input.inputs.productBrief ?? input.inputs.product });
  },
};

export const hookGeneratorAgent: AgentDefinition = {
  identity: { agentId: "hook-generator", version: "1.0.0", domain: "copy" },
  riskLevel: "low",
  allowedTools: [],
  async execute(input) {
    return result({
      hooks: [
        "Show the problem before explaining the product.",
        "Lead with the most concrete proof available.",
        "Expose the failed alternative before introducing the solution.",
        "Turn the strongest customer objection into the opening question.",
        "Demonstrate the product in the first seconds rather than describing it.",
      ],
      basedOn: input.inputs,
    });
  },
};

export const scriptWriterAgent: AgentDefinition = {
  identity: { agentId: "script-writer", version: "1.0.0", domain: "copy" },
  riskLevel: "low",
  allowedTools: [],
  async execute(input) {
    return result({
      structure: ["Hook", "Proof/Demo", "Problem", "Mechanism", "Offer", "Objection handling", "CTA"],
      brief: input.inputs,
    });
  },
};

export const qaValidatorAgent: AgentDefinition = {
  identity: { agentId: "qa-validator", version: "1.0.0", domain: "quality" },
  riskLevel: "low",
  allowedTools: [],
  async execute(input) {
    const required = ["hook", "proof", "offer", "cta"];
    return result({
      passed: false,
      checks: required.map((name) => ({ name, status: "needs_evidence" })),
      note: "The first implementation validates structure; semantic scoring will be added to the evaluation harness.",
      input: input.inputs,
    });
  },
};

export const initialAgents = [
  productResearchAgent,
  creativeStrategyAgent,
  angleGeneratorAgent,
  hookGeneratorAgent,
  scriptWriterAgent,
  qaValidatorAgent,
] as const;
