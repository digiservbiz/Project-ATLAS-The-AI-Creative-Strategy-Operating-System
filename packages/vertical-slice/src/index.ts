import {
  type ExperimentOutcome,
  createLearningFromOutcome,
  type LearningRecord,
  type NextBestAction,
  generateNextBestActions,
} from "@atlas/intelligence";
import { buildStageArtifactChain, type StageArtifact } from "./lineage.js";

export type SliceStage =
  | "product"
  | "strategy"
  | "intelligence-decision"
  | "orchestrator"
  | "execution"
  | "performance"
  | "learning"
  | "next-action";

export interface ProductInput {
  productId: string;
  productName: string;
  customerProblem: string;
  audience: string;
  offer: string;
  organizationId: string;
  projectId: string;
}

export interface StrategyDecision {
  hypothesisId: string;
  angle: string;
  hook: string;
  promise: string;
  proofRequirement: string;
  offer: string;
  confidence: number;
}

export interface IntelligenceDecision {
  decisionId: string;
  hypothesis: StrategyDecision;
  evidence: string[];
  semanticMatches: string[];
  confidence: number;
  decision: "proceed" | "research-more" | "reject";
  reason: string;
}

export interface ExecutionPlan {
  executionId: string;
  channel: "meta";
  creativeVariant: string;
  budgetCents: number;
  approvalRequired: boolean;
}

export interface PerformanceSnapshot {
  executionId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spendCents: number;
  ctr: number;
  conversionRate: number;
  costPerConversionCents: number;
  fatigueScore: number;
}

export interface FailureEvent {
  stage: SliceStage;
  code: string;
  message: string;
  severity: "warning" | "error";
}

export interface ScenarioOverrides {
  strategyConfidence?: number;
  intelligenceConfidence?: number;
  intelligenceDecision?: IntelligenceDecision["decision"];
  semanticMatches?: string[];
  approvalRequired?: boolean;
  budgetCents?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  spendCents?: number;
  fatigueScore?: number;
  learningConfidence?: number;
  suppressNextActions?: boolean;
}

export interface VerticalSliceResult {
  runId: string;
  status: "completed" | "needs_review" | "failed";
  stages: SliceStage[];
  artifacts: StageArtifact[];
  product: ProductInput;
  strategy: StrategyDecision;
  intelligence: IntelligenceDecision;
  execution: ExecutionPlan;
  performance: PerformanceSnapshot;
  learning: LearningRecord;
  nextActions: NextBestAction[];
  failures: FailureEvent[];
}

const FIXED_NOW = "2026-01-15T00:00:00.000Z";

function fail(
  failures: FailureEvent[],
  stage: SliceStage,
  code: string,
  message: string,
  severity: FailureEvent["severity"] = "error",
) {
  failures.push({ stage, code, message, severity });
}

function hasSemanticSupport(matches: string[]) {
  return matches.some((match) => match.includes("customer_problem"))
    && matches.some((match) => match.includes("angle:"))
    && matches.some((match) => match.includes("offer:"));
}

export function runDeterministicScenario(
  product: ProductInput,
  overrides: ScenarioOverrides = {},
): VerticalSliceResult {
  const failures: FailureEvent[] = [];
  const stages: SliceStage[] = [];

  stages.push("product");
  if (!product.productId || !product.productName || !product.customerProblem || !product.audience || !product.offer
    || !product.organizationId || !product.projectId) {
    fail(failures, "product", "PRODUCT_INCOMPLETE", "Product input is missing a required field.");
  }

  stages.push("strategy");
  const strategy: StrategyDecision = {
    hypothesisId: "hyp:problem-solution-01",
    angle: "problem-solution",
    hook: `Still struggling with ${product.customerProblem}?`,
    promise: `Show a simpler path to solve ${product.customerProblem}.`,
    proofRequirement: "Use a verifiable product demonstration or customer proof before scaling.",
    offer: product.offer,
    confidence: overrides.strategyConfidence ?? 0.74,
  };

  if (strategy.confidence < 0.6) {
    fail(failures, "strategy", "LOW_STRATEGY_CONFIDENCE", "Strategy confidence is below the deterministic launch threshold.");
  }

  stages.push("intelligence-decision");
  const semanticMatches = overrides.semanticMatches ?? [
    "customer_problem:high similarity",
    "angle:problem-solution",
    "offer:current",
  ];
  const intelligence: IntelligenceDecision = {
    decisionId: "decision:001",
    hypothesis: strategy,
    evidence: ["product brief", "semantic retrieval", "strategy rules"],
    semanticMatches,
    confidence: overrides.intelligenceConfidence ?? 0.78,
    decision: overrides.intelligenceDecision ?? "proceed",
    reason: "The proposed angle is supported by the supplied problem and semantic context, but proof is still required before scaling.",
  };

  if (intelligence.confidence < 0.6) {
    fail(failures, "intelligence-decision", "LOW_DECISION_CONFIDENCE", "Decision confidence is below the deterministic launch threshold.");
  }
  if (!hasSemanticSupport(intelligence.semanticMatches)) {
    fail(failures, "intelligence-decision", "SEMANTIC_RETRIEVAL_MISMATCH", "Semantic retrieval does not support the selected strategy across problem, angle, and offer.");
  }
  if (intelligence.decision !== "proceed") {
    fail(failures, "intelligence-decision", "DECISION_BLOCKED", `Intelligence decision is '${intelligence.decision}', so execution must not proceed.`);
  }

  stages.push("orchestrator");
  const execution: ExecutionPlan = {
    executionId: "exec:001",
    channel: "meta",
    creativeVariant: "creative:problem-solution-v1",
    budgetCents: overrides.budgetCents ?? 5000,
    approvalRequired: overrides.approvalRequired ?? true,
  };

  if (!execution.approvalRequired) {
    fail(failures, "orchestrator", "APPROVAL_BOUNDARY_BYPASSED", "Paid execution must require explicit approval in the default policy.");
  }
  if (intelligence.decision !== "proceed") {
    fail(failures, "orchestrator", "BLOCKED_DECISION_EXECUTED", "Orchestrator received a non-proceed decision but produced an executable plan.");
  }

  stages.push("execution");
  if (execution.budgetCents <= 0 || !Number.isFinite(execution.budgetCents)) {
    fail(failures, "execution", "INVALID_BUDGET", "Execution budget must be a finite number greater than zero.");
  }
  if (!execution.creativeVariant) {
    fail(failures, "execution", "MISSING_CREATIVE", "Execution requires a creative variant identifier.");
  }

  stages.push("performance");
  const performance: PerformanceSnapshot = {
    executionId: execution.executionId,
    impressions: overrides.impressions ?? 10000,
    clicks: overrides.clicks ?? 420,
    conversions: overrides.conversions ?? 14,
    spendCents: overrides.spendCents ?? 5000,
    ctr: (overrides.impressions ?? 10000) > 0 ? (overrides.clicks ?? 420) / (overrides.impressions ?? 10000) : 0,
    conversionRate: (overrides.clicks ?? 420) > 0 ? (overrides.conversions ?? 14) / (overrides.clicks ?? 420) : 0,
    costPerConversionCents: (overrides.conversions ?? 14) > 0 ? (overrides.spendCents ?? 5000) / (overrides.conversions ?? 14) : Number.POSITIVE_INFINITY,
    fatigueScore: overrides.fatigueScore ?? 0.82,
  };

  if (performance.impressions < 0 || performance.clicks < 0 || performance.conversions < 0 || performance.spendCents < 0) {
    fail(failures, "performance", "INVALID_PERFORMANCE_DATA", "Performance metrics cannot be negative.");
  }
  if (performance.clicks > performance.impressions) {
    fail(failures, "performance", "IMPOSSIBLE_CLICK_VOLUME", "Clicks cannot exceed impressions.");
  }
  if (performance.conversions > performance.clicks) {
    fail(failures, "performance", "IMPOSSIBLE_CONVERSION_VOLUME", "Conversions cannot exceed clicks.");
  }
  if (performance.conversions <= 0) {
    fail(failures, "performance", "NO_CONVERSIONS", "Performance data contains no conversions; learning should not declare a winner.", "warning");
  }

  stages.push("learning");
  const outcome: ExperimentOutcome = {
    experimentId: "exp:001",
    hypothesisId: strategy.hypothesisId,
    variable: "problem-solution angle",
    sampleSize: performance.conversions,
    confidence: overrides.learningConfidence ?? 0.84,
    winner: strategy.angle,
    result: "supported",
    evidenceIds: ["exec:001", "perf:001"],
    audienceId: product.audience,
    platform: execution.channel,
    businessId: "demo-business",
    period: { start: "2026-01-01", end: "2026-01-14" },
  };
  const learning = createLearningFromOutcome(outcome);
  learning.createdAt = FIXED_NOW;

  if (performance.conversions <= 0 || learning.confidence < 0.6) {
    fail(failures, "learning", "INSUFFICIENT_LEARNING_EVIDENCE", "Learning requires conversions and confidence at or above the deterministic threshold.");
  }

  stages.push("next-action");
  const nextActions = overrides.suppressNextActions ? [] : generateNextBestActions({
    fatigueScore: performance.fatigueScore,
    angleGap: true,
    learningConfidence: learning.confidence,
  });

  if (!nextActions.length) {
    fail(failures, "next-action", "NO_NEXT_ACTION", "A completed learning cycle must produce at least one next action.");
  }

  const runId = "scenario:product-to-learning-001";
  const artifacts = buildStageArtifactChain({
    runId,
    organizationId: product.organizationId,
    projectId: product.projectId,
    stages,
  });

  return {
    runId,
    status: failures.some((failure) => failure.severity === "error") ? "failed" : nextActions.some((action) => action.requiredApproval) ? "needs_review" : "completed",
    stages,
    artifacts,
    product,
    strategy,
    intelligence,
    execution,
    performance,
    learning,
    nextActions,
    failures,
  };
}

export const deterministicScenarioInput: ProductInput = {
  productId: "product:atlas-demo",
  productName: "Atlas Demo Product",
  customerProblem: "wasting time choosing the right solution",
  audience: "time-poor ecommerce buyers",
  offer: "starter offer with proof-led demo",
  organizationId: "org:atlas-demo",
  projectId: "project:atlas-demo",
};
