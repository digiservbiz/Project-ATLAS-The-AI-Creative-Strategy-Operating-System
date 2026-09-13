import {
  type ExperimentOutcome,
  createLearningFromOutcome,
  type LearningRecord,
  type NextBestAction,
  generateNextBestActions,
} from "@atlas/intelligence";

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

export interface VerticalSliceResult {
  runId: string;
  status: "completed" | "needs_review" | "failed";
  stages: SliceStage[];
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

function fail(failures: FailureEvent[], stage: SliceStage, code: string, message: string, severity: FailureEvent["severity"] = "error") {
  failures.push({ stage, code, message, severity });
}

export function runDeterministicScenario(product: ProductInput): VerticalSliceResult {
  const failures: FailureEvent[] = [];
  const stages: SliceStage[] = [];

  stages.push("product");
  if (!product.productId || !product.customerProblem || !product.audience || !product.offer) {
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
    confidence: 0.74,
  };

  stages.push("intelligence-decision");
  const semanticMatches = [
    "customer_problem:high similarity",
    "angle:problem-solution",
    "offer:current",
  ];
  const intelligence: IntelligenceDecision = {
    decisionId: "decision:001",
    hypothesis: strategy,
    evidence: ["product brief", "semantic retrieval", "strategy rules"],
    semanticMatches,
    confidence: 0.78,
    decision: "proceed",
    reason: "The proposed angle is supported by the supplied problem and semantic context, but proof is still required before scaling.",
  };

  if (intelligence.confidence < 0.6) {
    fail(failures, "intelligence-decision", "LOW_DECISION_CONFIDENCE", "Decision confidence is below the deterministic launch threshold.");
  }

  stages.push("orchestrator");
  const execution: ExecutionPlan = {
    executionId: "exec:001",
    channel: "meta",
    creativeVariant: "creative:problem-solution-v1",
    budgetCents: 5000,
    approvalRequired: true,
  };

  if (!execution.approvalRequired) {
    fail(failures, "orchestrator", "APPROVAL_BOUNDARY_BYPASSED", "Paid execution must require explicit approval in the default policy.");
  }

  stages.push("execution");
  if (execution.budgetCents <= 0) {
    fail(failures, "execution", "INVALID_BUDGET", "Execution budget must be greater than zero.");
  }

  stages.push("performance");
  const performance: PerformanceSnapshot = {
    executionId: execution.executionId,
    impressions: 10000,
    clicks: 420,
    conversions: 14,
    spendCents: 5000,
    ctr: 0.042,
    conversionRate: 14 / 420,
    costPerConversionCents: 5000 / 14,
    fatigueScore: 0.82,
  };

  if (performance.conversions <= 0) {
    fail(failures, "performance", "NO_CONVERSIONS", "Performance data contains no conversions; learning should not declare a winner.", "warning");
  }

  stages.push("learning");
  const outcome: ExperimentOutcome = {
    experimentId: "exp:001",
    hypothesisId: strategy.hypothesisId,
    variable: "problem-solution angle",
    sampleSize: performance.conversions,
    confidence: 0.84,
    winner: strategy.angle,
    result: "supported",
    evidenceIds: ["exec:001", "perf:001"],
    audienceId: product.audience,
    platform: execution.channel,
    businessId: "demo-business",
    period: { start: "2026-01-01", end: "2026-01-14" },
  };
  const learning = createLearningFromOutcome(outcome);
  // Keep this deterministic: the runtime clock must never change the scenario result.
  learning.createdAt = FIXED_NOW;

  stages.push("next-action");
  const nextActions = generateNextBestActions({
    fatigueScore: performance.fatigueScore,
    angleGap: true,
    learningConfidence: learning.confidence,
  });

  if (!nextActions.length) {
    fail(failures, "next-action", "NO_NEXT_ACTION", "A completed learning cycle must produce at least one next action.");
  }

  return {
    runId: "scenario:product-to-learning-001",
    status: failures.some((failure) => failure.severity === "error") ? "failed" : nextActions.some((action) => action.requiredApproval) ? "needs_review" : "completed",
    stages,
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
};
