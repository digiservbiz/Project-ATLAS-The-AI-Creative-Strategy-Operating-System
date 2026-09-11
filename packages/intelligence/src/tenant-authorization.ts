export interface TenantScope {
  organizationId: string;
  projectId?: string;
}

export interface TenantPrincipal {
  organizationId: string;
  projectIds?: readonly string[];
}

/**
 * Authorization boundary for tenant-scoped ATLAS services.
 * Authentication is intentionally supplied by the application layer; this
 * contract only decides whether an authenticated principal may access a scope.
 */
export function assertTenantAccess(scope: TenantScope, principal: TenantPrincipal): void {
  if (!scope.organizationId || !principal.organizationId) {
    throw new Error("Organization scope is required");
  }

  if (scope.organizationId !== principal.organizationId) {
    throw new Error("Tenant access denied: organization mismatch");
  }

  if (scope.projectId !== undefined) {
    if (!principal.projectIds?.includes(scope.projectId)) {
      throw new Error("Tenant access denied: project mismatch");
    }
  }
}

export function requireTenantScope(scope: TenantScope): TenantScope {
  if (!scope.organizationId.trim()) throw new Error("Organization scope is required");
  if (scope.projectId !== undefined && !scope.projectId.trim()) {
    throw new Error("Project scope cannot be empty");
  }
  return { organizationId: scope.organizationId, ...(scope.projectId ? { projectId: scope.projectId } : {}) };
}
