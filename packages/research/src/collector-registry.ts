import type { ResearchCollector, ResearchEvidence, ResearchQuery } from "./research-intelligence-hub";

export interface CollectorHealth { name: string; enabled: boolean; supports: ResearchQuery[]; lastError?: string; lastSuccessAt?: string; }

export class CollectorRegistry {
  private readonly collectors = new Map<string, ResearchCollector>();
  private readonly health = new Map<string, CollectorHealth>();

  register(name: string, collector: ResearchCollector, enabled = true) {
    if (this.collectors.has(name)) throw new Error(`Collector already registered: ${name}`);
    this.collectors.set(name, collector);
    this.health.set(name, { name, enabled, supports: [] });
  }

  setEnabled(name: string, enabled: boolean) {
    const state = this.health.get(name); if (!state) throw new Error(`Unknown collector: ${name}`);
    state.enabled = enabled;
  }

  matching(query: ResearchQuery): ResearchCollector[] {
    return [...this.collectors.entries()].filter(([name, collector]) => this.health.get(name)?.enabled && collector.supports(query)).map(([, collector]) => collector);
  }

  status(): CollectorHealth[] { return [...this.health.values()].map((item) => ({ ...item })); }

  async collect(query: ResearchQuery): Promise<ResearchEvidence[]> {
    const results: ResearchEvidence[] = [];
    for (const [name, collector] of this.collectors) {
      const state = this.health.get(name)!;
      if (!state.enabled || !collector.supports(query)) continue;
      try {
        const evidence = await collector.collect(query);
        results.push(...evidence);
        state.lastSuccessAt = new Date().toISOString();
        state.lastError = undefined;
      } catch (error) {
        state.lastError = error instanceof Error ? error.message : "Collector failed";
      }
    }
    return results;
  }
}

export abstract class HttpResearchCollector implements ResearchCollector {
  abstract supports(query: ResearchQuery): boolean;
  protected abstract request(query: ResearchQuery): Promise<unknown>;
  protected abstract map(query: ResearchQuery, raw: unknown): ResearchEvidence[];
  async collect(query: ResearchQuery): Promise<ResearchEvidence[]> { return this.map(query, await this.request(query)); }
}
