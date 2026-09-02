import type { AgentContext } from "@atlas/orchestrator";
import type { BusinessIntelligenceModel, IntelligenceSnapshot, PersistentIntelligenceService } from "@atlas/intelligence";

export interface ProductionBusinessModelLoader {
  /** Implementations must resolve a model only from the tenant/project in context. */
  load(context: AgentContext): Promise<BusinessIntelligenceModel | null>;
}

export interface ProductionIntelligenceContextLoader {
  enrich(context: AgentContext): Promise<AgentContext>;
}

/**
 * Resolves the canonical business model at the production boundary and hydrates
 * the orchestration context with the persisted intelligence snapshot.
 *
 * The loader deliberately depends on interfaces rather than a specific database
 * or HTTP client. The application composition root supplies the real business
 * model loader and PersistentIntelligenceService backed by production storage.
 */
export class PersistentProductionIntelligenceContextLoader implements ProductionIntelligenceContextLoader {
  constructor(
    private readonly businessModelLoader: ProductionBusinessModelLoader,
    private readonly intelligence: PersistentIntelligenceService,
  ) {}

  async enrich(context: AgentContext): Promise<AgentContext> {
    const model = await this.businessModelLoader.load(context);
    if (!model) return context;

    const snapshot = await this.intelligence.loadSnapshot(model, context.objective);
    this.validateSnapshotScope(snapshot);

    return {
      ...context,
      memory: {
        ...context.memory,
        intelligenceSnapshot: snapshot,
      },
    };
  }

  private validateSnapshotScope(snapshot: IntelligenceSnapshot): void {
    if (snapshot.business.business.id !== snapshot.state.businessId) {
      throw new Error("Intelligence snapshot business/state scope mismatch");
    }
  }
}
