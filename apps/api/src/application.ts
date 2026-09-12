import { generateNextBestActions, type ActionSignals } from "@atlas/intelligence";

export interface TenantScope {
  organizationId: string;
  projectId?: string;
}

export interface IntelligenceActionsRequest {
  tenant: TenantScope;
  signals: ActionSignals;
}

export interface AtlasApplication {
  getIntelligenceActions(request: IntelligenceActionsRequest): ReturnType<typeof generateNextBestActions>;
}

function assertTenantScope(scope: TenantScope): void {
  if (!scope.organizationId.trim()) throw new Error("organizationId is required");
  if (scope.projectId !== undefined && !scope.projectId.trim()) {
    throw new Error("projectId must not be empty when provided");
  }
}

export function createAtlasApplication(): AtlasApplication {
  return {
    getIntelligenceActions(request) {
      assertTenantScope(request.tenant);
      return generateNextBestActions(request.signals);
    },
  };
}
