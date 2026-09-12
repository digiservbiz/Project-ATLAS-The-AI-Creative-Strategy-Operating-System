import { generateNextBestActions, type ActionSignals } from "@atlas/intelligence";
import type {
  AtlasAutonomousLoop,
  AtlasAutonomousLoopOptions,
  AtlasAutonomousLoopResult,
  AtlasOperatingLoopInput,
} from "@atlas/automation";

export interface TenantScope {
  organizationId: string;
  projectId?: string;
}

export interface IntelligenceActionsRequest {
  tenant: TenantScope;
  signals: ActionSignals;
}

export interface AutonomousRunRequest {
  tenant: TenantScope;
  input: AtlasOperatingLoopInput;
  options?: AtlasAutonomousLoopOptions;
}

export interface AtlasApplication {
  getIntelligenceActions(request: IntelligenceActionsRequest): ReturnType<typeof generateNextBestActions>;
  runAutonomous(request: AutonomousRunRequest): Promise<AtlasAutonomousLoopResult>;
}

function assertTenantScope(scope: TenantScope): void {
  if (!scope.organizationId.trim()) throw new Error("organizationId is required");
  if (scope.projectId !== undefined && !scope.projectId.trim()) {
    throw new Error("projectId must not be empty when provided");
  }
}

function assertInputTenant(request: AutonomousRunRequest): void {
  assertTenantScope(request.tenant);
  if (request.input.organizationId !== request.tenant.organizationId) {
    throw new Error("organizationId does not match autonomous run input");
  }
  if (request.input.projectId !== request.tenant.projectId) {
    throw new Error("projectId does not match autonomous run input");
  }
}

export function createAtlasApplication(dependencies: { autonomousLoop: AtlasAutonomousLoop }): AtlasApplication {
  return {
    getIntelligenceActions(request) {
      assertTenantScope(request.tenant);
      return generateNextBestActions(request.signals);
    },
    async runAutonomous(request) {
      assertInputTenant(request);
      return dependencies.autonomousLoop.run(request.input, request.options);
    },
  };
}
