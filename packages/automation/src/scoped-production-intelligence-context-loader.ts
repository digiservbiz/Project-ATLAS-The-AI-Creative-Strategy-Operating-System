import type { AgentContext } from "@atlas/orchestrator";
import type { BusinessIntelligenceModel, ScopedPersistentIntelligenceService } from "@atlas/intelligence";
import type { ProductionBusinessModelLoader, ProductionIntelligenceContextLoader } from "./intelligence-context-loader";

/**
 * Production adapter that derives intelligence persistence scope directly from
 * the authenticated AgentContext for every job. No mutable tenant state is
 * shared between workers or concurrent requests.
 */
export class ScopedProductionIntelligenceContextLoader implements ProductionIntelligenceContextLoader {
  constructor(
    private readonly businessModelLoader: ProductionBusinessModelLoader,
    private readonly intelligence: ScopedPersistentIntelligenceService,
  ) {}

  async enrich(context: AgentContext): Promise<AgentContext> {
    if (!context.organizationId) throw new Error("organizationId is required");
    if (!context.projectId) throw new Error("projectId is required for production intelligence");

    const model = await this.businessModelLoader.load(context);
    if (!model) return context;

    const snapshot = await this.intelligence.loadSnapshot(
      { organizationId: context.organizationId, projectId: context.projectId },
      model,
      context.objective,
    );

    return {
      ...context,
      memory: {
        ...context.memory,
        intelligenceSnapshot: snapshot,
      },
    };
  }
}
