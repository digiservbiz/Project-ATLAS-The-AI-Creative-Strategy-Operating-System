import type { CampaignRecord, LearningMemoryRecord, MetricsRecord, PersistenceStore, StrategyDecisionRecord } from "./persistence-contracts";

export interface PersistenceTransaction {
  saveCampaign(record: CampaignRecord): Promise<void>;
  saveMetrics(record: MetricsRecord): Promise<void>;
  saveMemory(record: LearningMemoryRecord): Promise<void>;
  saveDecision(record: StrategyDecisionRecord): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface TransactionFactory { begin(): Promise<PersistenceTransaction>; }

export class StoreTransactionFactory implements TransactionFactory {
  constructor(private readonly store: PersistenceStore) {}

  async begin(): Promise<PersistenceTransaction> {
    const campaigns: CampaignRecord[] = [];
    const metrics: MetricsRecord[] = [];
    const memories: LearningMemoryRecord[] = [];
    const decisions: StrategyDecisionRecord[] = [];
    let closed = false;
    const ensureOpen = () => { if (closed) throw new Error("Persistence transaction is closed"); };
    return {
      saveCampaign: async (r) => { ensureOpen(); campaigns.push(r); },
      saveMetrics: async (r) => { ensureOpen(); metrics.push(r); },
      saveMemory: async (r) => { ensureOpen(); memories.push(r); },
      saveDecision: async (r) => { ensureOpen(); decisions.push(r); },
      commit: async () => {
        ensureOpen();
        for (const r of campaigns) await this.store.campaigns.save(r);
        for (const r of metrics) await this.store.metrics.save(r);
        for (const r of memories) await this.store.memories.save(r);
        for (const r of decisions) await this.store.decisions.save(r);
        closed = true;
      },
      rollback: async () => { closed = true; campaigns.length = 0; metrics.length = 0; memories.length = 0; decisions.length = 0; },
    };
  }
}
