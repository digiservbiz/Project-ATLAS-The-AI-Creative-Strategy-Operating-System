export type ReadinessStatus = "pass" | "warn" | "fail";
export interface ReadinessCheck { id: string; status: ReadinessStatus; message: string; blocking: boolean; }
export interface ProductionReadinessReport { ready: boolean; checks: ReadinessCheck[]; generatedAt: string; }

export interface ProductionDependencies {
  database: boolean;
  secretsManager: boolean;
  scheduler: boolean;
  monitoring: boolean;
  backups: boolean;
  metaCredentials: boolean;
  tiktokCredentials: boolean;
  shopifyCredentials: boolean;
  endToEndTests: boolean;
  tenantIsolationReviewed: boolean;
  humanApprovalPolicyConfigured: boolean;
}

export class ProductionReadinessGate {
  evaluate(d: ProductionDependencies): ProductionReadinessReport {
    const checks: ReadinessCheck[] = Object.entries(d).map(([id, value]) => ({
      id,
      status: value ? "pass" : "fail",
      message: value ? "Configured/verified" : "Required before production autonomy",
      blocking: !value,
    }));
    return { ready: checks.every((c) => !c.blocking), checks, generatedAt: new Date().toISOString() };
  }
}
