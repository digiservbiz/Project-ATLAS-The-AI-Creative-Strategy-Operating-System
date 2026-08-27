export interface HealthCheck { name: string; check(): Promise<boolean>; }
export interface HealthReport { healthy: boolean; checks: Record<string, boolean>; checkedAt: string; }

export class ProductionHealthService {
  constructor(private readonly checks: HealthCheck[]) {}
  async check(): Promise<HealthReport> {
    const results: Record<string, boolean> = {};
    for (const check of this.checks) {
      try { results[check.name] = await check.check(); } catch { results[check.name] = false; }
    }
    return { healthy: Object.values(results).every(Boolean), checks: results, checkedAt: new Date().toISOString() };
  }
}
