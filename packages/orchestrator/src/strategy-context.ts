import type { AgentContext } from "./types";
import type { SemanticMemoryHit, SemanticIndex } from "@atlas/performance-intelligence";

export interface StrategyContextRequest {
  organizationId: string;
  platform?: "meta" | "tiktok" | "google";
  objective: string;
  audience?: string;
  product?: string;
  limit?: number;
}

export interface StrategyContext {
  request: StrategyContextRequest;
  historicalEvidence: SemanticMemoryHit[];
}

export class StrategyContextBuilder {
  constructor(private readonly semanticIndex: SemanticIndex) {}

  async build(context: AgentContext, request: Omit<StrategyContextRequest, "organizationId">): Promise<StrategyContext> {
    const organizationId = context.organizationId;
    if (!organizationId) throw new Error("organizationId is required");
    const query = [request.objective, request.audience, request.product].filter(Boolean).join(" | ");
    const historicalEvidence = await this.semanticIndex.search({
      query,
      organizationId,
      platform: request.platform,
      limit: request.limit ?? 5,
    });
    return { request: { ...request, organizationId }, historicalEvidence };
  }
}
