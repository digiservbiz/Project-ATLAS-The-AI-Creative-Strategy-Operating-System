import type { ResearchInsight, ResearchQuery, ResearchIntelligenceHub } from "@atlas/research";
import { ResearchStrategyBridge, type ResearchStrategySignals } from "./research-strategy-bridge";

export interface ResearchDrivenStrategyRequest {
  productId: string;
  objective: string;
  queries: ResearchQuery[];
}

export interface ResearchDrivenStrategyResult {
  insights: ResearchInsight[];
  signals: ResearchStrategySignals;
}

export class ResearchDrivenStrategyOrchestrator {
  constructor(private readonly research: ResearchIntelligenceHub, private readonly bridge = new ResearchStrategyBridge()) {}

  async build(input: ResearchDrivenStrategyRequest): Promise<ResearchDrivenStrategyResult> {
    const batches = await Promise.all(input.queries.map((query) => this.research.research(query)));
    const insights = batches.flat();
    return { insights, signals: this.bridge.build({ productId: input.productId, objective: input.objective, insights }) };
  }
}
