import type { IntelligenceSnapshot, PersistentIntelligenceService, PlatformPerformanceInput } from "@atlas/intelligence";
import { selectNextWorkflow, type WorkflowDecision } from "@atlas/intelligence";
import type { AgentContext, WorkflowRun, WorkflowStep } from "@atlas/orchestrator";
import type { ProductAnalysis, ProductUrlAnalyzer } from "../../creative-intelligence/src/product-url";
import { CreativeProductionPlanner, type CreativeBrief } from "../../creative-intelligence/src/creative-production";
import { buildStrategyPack, type StrategyPack } from "../../creative-intelligence/src/strategy-pack";
import type { PerformanceIntelligenceIngestion, PerformanceIntelligenceIngestionResult } from "./performance-intelligence-ingestion";
import { IntelligenceAwareOrchestrator } from "./intelligence-aware-orchestrator";

export interface AtlasOperatingLoopInput {
  runId: string;
  productUrl: string;
  objective?: string;
  organizationId: string;
  projectId?: string;
  snapshot: IntelligenceSnapshot;
  performance?: PlatformPerformanceInput;
  workflowSteps?: WorkflowStep[];
}

export interface AtlasOperatingLoopResult {
  analysis: ProductAnalysis;
  briefs: CreativeBrief[];
  strategy: StrategyPack;
  workflow: WorkflowRun;
  decision: WorkflowDecision;
  performance?: PerformanceIntelligenceIngestionResult;
  nextSnapshot: IntelligenceSnapshot;
  nextDecision: WorkflowDecision;
}

export interface AtlasOperatingLoopDependencies {
  analyzer: ProductUrlAnalyzer;
  planner?: CreativeProductionPlanner;
  orchestrator: IntelligenceAwareOrchestrator;
  performanceIngestion?: PerformanceIntelligenceIngestion;
  intelligence: PersistentIntelligenceService;
}

export class AtlasOperatingLoop {
  constructor(private readonly dependencies: AtlasOperatingLoopDependencies) {}

  async run(input: AtlasOperatingLoopInput): Promise<AtlasOperatingLoopResult> {
    if (input.snapshot.business.business.id !== input.snapshot.state.businessId) {
      throw new Error("Intelligence snapshot business/state scope mismatch");
    }

    const analysis = await this.dependencies.analyzer.analyze(input.productUrl);
    const briefs = (this.dependencies.planner ?? new CreativeProductionPlanner()).plan(analysis);
    const strategy = buildStrategyPack(analysis, input.snapshot, briefs, input.objective);
    const decision = selectNextWorkflow({ snapshot: input.snapshot, signals: {} });

    const context: AgentContext = {
      organizationId: input.organizationId,
      projectId: input.projectId,
      objective: input.objective ?? "Launch a performance creative test",
      inputs: {
        productUrl: input.productUrl,
        strategyPack: strategy,
        creativeBriefs: briefs,
      },
      memory: { intelligenceSnapshot: input.snapshot },
    };

    const workflow = await this.dependencies.orchestrator.run(
      input.runId,
      context,
      input.workflowSteps ?? [{ id: "strategy-execution", skillId: "atlas:execution" }],
    );

    let performance: PerformanceIntelligenceIngestionResult | undefined;
    let nextSnapshot = input.snapshot;
    if (input.performance) {
      if (!this.dependencies.performanceIngestion) {
        throw new Error("Performance ingestion is required when performance data is supplied");
      }
      if (workflow.status !== "completed") {
        throw new Error("Performance cannot be ingested until the operating workflow completes");
      }
      performance = await this.dependencies.performanceIngestion.process(input.performance, input.snapshot);
      nextSnapshot = performance.snapshot;
    }

    const nextDecision = selectNextWorkflow({ snapshot: nextSnapshot, signals: {} });
    return { analysis, briefs, strategy, workflow, decision, performance, nextSnapshot, nextDecision };
  }
}
