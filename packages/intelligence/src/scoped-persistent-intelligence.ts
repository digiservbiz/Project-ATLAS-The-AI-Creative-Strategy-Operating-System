import type { BusinessIntelligenceModel } from "./business-intelligence-model";
import type { IntelligenceSnapshot } from "./intelligence-hub";
import type { LearningRecord } from "./learning-loop";
import { PersistentIntelligenceService } from "./persistent-intelligence-service";
import type { IntelligenceRepository } from "./persistence-contract";
import type { SemanticIntelligenceService } from "@atlas/semantic-intelligence";

export interface IntelligenceTenantScope {
  organizationId: string;
  projectId: string;
}

export interface ScopedPersistentIntelligenceOptions {
  repositoryFactory: (scope: IntelligenceTenantScope) => IntelligenceRepository;
  semanticServiceFactory?: (scope: IntelligenceTenantScope) => SemanticIntelligenceService | undefined;
}

/**
 * Creates a persistence service per authenticated tenant/project scope.
 * The repository factory is deliberately invoked for every scope instead of
 * storing a mutable scope on a shared repository, preventing cross-request
 * tenant leakage in concurrent workers.
 */
export class ScopedPersistentIntelligenceService {
  constructor(private readonly options: ScopedPersistentIntelligenceOptions) {}

  forScope(scope: IntelligenceTenantScope): PersistentIntelligenceService {
    if (!scope.organizationId.trim()) throw new Error("organizationId is required");
    if (!scope.projectId.trim()) throw new Error("projectId is required");

    const semanticService = this.options.semanticServiceFactory?.(scope);
    return new PersistentIntelligenceService({
      repository: this.options.repositoryFactory(scope),
      semanticService,
      semanticScope: semanticService ? scope : undefined,
    });
  }

  async loadSnapshot(scope: IntelligenceTenantScope, model: BusinessIntelligenceModel, objective?: string): Promise<IntelligenceSnapshot> {
    this.assertModelScope(scope, model);
    return this.forScope(scope).loadSnapshot(model, objective);
  }

  async recordLearning(scope: IntelligenceTenantScope, learning: LearningRecord) {
    this.assertBusinessId(scope, learning.businessId);
    return this.forScope(scope).recordLearning(learning);
  }

  private assertBusinessId(scope: IntelligenceTenantScope, businessId: string): void {
    if (!businessId.trim()) throw new Error("businessId is required");
    // Business IDs are resolved by the scoped business-model loader. This check
    // ensures an empty/invalid scope can never reach persistence.
    if (!scope.organizationId.trim() || !scope.projectId.trim()) {
      throw new Error("Invalid intelligence tenant scope");
    }
  }

  private assertModelScope(scope: IntelligenceTenantScope, model: BusinessIntelligenceModel): void {
    if (!model.business.id.trim()) throw new Error("businessId is required");
    if (!scope.organizationId.trim() || !scope.projectId.trim()) {
      throw new Error("Invalid intelligence tenant scope");
    }
  }
}
