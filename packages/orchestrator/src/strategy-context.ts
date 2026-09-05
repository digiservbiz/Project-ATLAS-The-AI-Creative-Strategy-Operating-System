import type { AgentContext } from "./types";
import type { SemanticSearchResult } from "@atlas/contracts";
import type { SemanticIntelligenceService } from "@atlas/semantic-intelligence";

export interface StrategyContextRequest {
  organizationId: string;
  projectId: string;
  platform?: "meta" | "tiktok" | "google";
  objective: string;
  audience?: string;
  product?: string;
  limit?: number;
}

export interface StrategyEvidence {
  key: string;
  score: number;
  object: SemanticSearchResult["object"];
  provenance: Record<string, unknown>;
}

export interface StrategyContext {
  request: StrategyContextRequest;
  historicalEvidence: StrategyEvidence[];
}

export class StrategyContextBuilder {
  constructor(private readonly semanticIndex: SemanticIntelligenceService) {}

  async build(
    context: AgentContext,
    request: Omit<StrategyContextRequest, "organizationId" | "projectId">
  ): Promise<StrategyContext> {
    const organizationId = context.organizationId;
    const projectId = context.projectId;
    if (!organizationId) throw new Error("organizationId is required");
    if (!projectId) throw new Error("projectId is required");
    const query = [request.objective, request.audience, request.product]
      .filter(Boolean)
      .join(" | ");
    const response = await this.semanticIndex.search({
      query,
      organizationId,
      projectId,
      topK: request.limit ?? 5,
      objectTypes: [],
      filters: request.platform ? { platform: request.platform } : {},
    });
    const historicalEvidence = response.results.map((hit) => ({
      key: hit.object.id,
      score: hit.similarity,
      object: hit.object,
      provenance: hit.provenance,
    }));
    return {
      request: { ...request, organizationId, projectId },
      historicalEvidence,
    };
  }
}
