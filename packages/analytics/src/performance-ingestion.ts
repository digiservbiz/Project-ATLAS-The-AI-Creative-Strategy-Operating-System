export interface PerformanceEvent { id: string; platform: string; campaignId?: string; creativeId?: string; contentId?: string; timestamp: string; metrics: Record<string, number>; attribution?: { source?: string; medium?: string; campaign?: string; }; }
export interface PerformanceStore { save(events: PerformanceEvent[]): Promise<void>; }
export interface PerformanceSource { fetch(since?: string): Promise<PerformanceEvent[]>; }

export class PerformanceIngestionService {
  constructor(private readonly sources: PerformanceSource[], private readonly store: PerformanceStore) {}

  async ingest(since?: string) {
    const batches = await Promise.all(this.sources.map((source) => source.fetch(since)));
    const events = batches.flat();
    await this.store.save(events);
    return { count: events.length, events };
  }

  static aggregate(events: PerformanceEvent[]) {
    return events.reduce<Record<string, Record<string, number>>>((acc, event) => {
      const key = event.creativeId ?? event.contentId ?? event.campaignId ?? `${event.platform}:unattributed`;
      acc[key] ??= {};
      for (const [metric, value] of Object.entries(event.metrics)) acc[key][metric] = (acc[key][metric] ?? 0) + value;
      return acc;
    }, {});
  }
}
