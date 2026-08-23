export type WorkflowStage = "research" | "strategy" | "creative" | "qa" | "approval" | "campaign" | "performance" | "learning";

export interface ResearchContext { productId: string; query: string; evidence: unknown[]; learnings: unknown[]; }
export interface StrategyContext { productId: string; research: ResearchContext; strategy: unknown; }
export interface CreativeContext { strategy: StrategyContext; creatives: unknown[]; }
export interface WorkflowState { runId: string; stage: WorkflowStage; status: "running" | "blocked" | "completed" | "failed"; context: Record<string, unknown>; }

export interface OrchestratorDependencies {
  research(input: { productId: string; query: string }): Promise<ResearchContext>;
  strategy(input: ResearchContext): Promise<StrategyContext>;
  creative(input: StrategyContext): Promise<CreativeContext>;
  qa(input: CreativeContext): Promise<{ approved: boolean; context: CreativeContext }>;
  requestApproval(input: CreativeContext): Promise<{ approvalId: string }>;
}

export class AtlasOrchestrator {
  constructor(private readonly deps: OrchestratorDependencies) {}

  async prepareCampaign(productId: string, query: string): Promise<WorkflowState> {
    const runId = `atlas:${productId}:${Date.now()}`;
    try {
      const research = await this.deps.research({ productId, query });
      const strategy = await this.deps.strategy(research);
      const creative = await this.deps.creative(strategy);
      const qa = await this.deps.qa(creative);
      if (!qa.approved) return { runId, stage: "qa", status: "blocked", context: { productId, research, strategy, creative } };
      const approval = await this.deps.requestApproval(creative);
      return { runId, stage: "approval", status: "blocked", context: { productId, research, strategy, creative, approvalId: approval.approvalId } };
    } catch (error) {
      return { runId, stage: "research", status: "failed", context: { productId, error: error instanceof Error ? error.message : String(error) } };
    }
  }
}
