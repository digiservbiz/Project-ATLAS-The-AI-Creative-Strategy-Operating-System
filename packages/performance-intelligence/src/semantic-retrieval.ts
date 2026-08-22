import type { AgentContext, AgentMemoryStore } from "@atlas/orchestrator";

export interface SemanticSearchRequest { query: string; organizationId: string; platform?: "meta" | "tiktok" | "google"; limit?: number; }
export interface SemanticMemoryHit { key: string; score: number; value: unknown; tags?: string[]; }

export interface SemanticIndex {
  search(request: SemanticSearchRequest): Promise<SemanticMemoryHit[]>;
}

export class PerformanceSemanticRetriever {
  constructor(private readonly index: SemanticIndex) {}

  async findSimilar(context: AgentContext, request: Omit<SemanticSearchRequest, "organizationId">): Promise<SemanticMemoryHit[]> {
    const organizationId = String((context as unknown as { organizationId?: string }).organizationId ?? "");
    if (!organizationId) throw new Error("organizationId is required for semantic retrieval");
    return this.index.search({ ...request, organizationId, limit: request.limit ?? 5 });
  }
}

export class MemoryBackedSemanticIndex implements SemanticIndex {
  constructor(private readonly memory: AgentMemoryStore) {}

  async search(request: SemanticSearchRequest): Promise<SemanticMemoryHit[]> {
    const search = (this.memory as unknown as { search?: (input: SemanticSearchRequest) => Promise<SemanticMemoryHit[]> }).search;
    if (!search) throw new Error("AgentMemoryStore does not expose semantic search");
    return search.call(this.memory, request);
  }
}
