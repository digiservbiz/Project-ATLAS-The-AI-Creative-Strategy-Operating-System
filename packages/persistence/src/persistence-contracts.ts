export interface CampaignRecord { id: string; brandId: string; productId: string; objective: string; stage: string; status: string; version: number; createdAt: string; updatedAt: string; data: unknown; }
export interface MetricsRecord { id: string; campaignId: string; creativeId?: string; source: string; collectedAt: string; metrics: Record<string, number | undefined>; }
export interface LearningMemoryRecord { id: string; campaignId?: string; category: string; statement: string; confidence: number; sourceIds: string[]; createdAt: string; }
export interface StrategyDecisionRecord { id: string; campaignId?: string; objective: string; recommendations: string[]; evidenceMemoryIds: string[]; createdAt: string; }

export interface PersistenceStore {
  campaigns: { get(id: string): Promise<CampaignRecord | null>; save(record: CampaignRecord): Promise<void>; };
  metrics: { save(record: MetricsRecord): Promise<void>; list(campaignId: string): Promise<MetricsRecord[]>; };
  memories: { save(record: LearningMemoryRecord): Promise<void>; list(campaignId?: string): Promise<LearningMemoryRecord[]>; };
  decisions: { save(record: StrategyDecisionRecord): Promise<void>; list(campaignId?: string): Promise<StrategyDecisionRecord[]>; };
}

export class InMemoryPersistenceStore implements PersistenceStore {
  private readonly campaignMap = new Map<string, CampaignRecord>();
  private readonly metricMap = new Map<string, MetricsRecord>();
  private readonly memoryMap = new Map<string, LearningMemoryRecord>();
  private readonly decisionMap = new Map<string, StrategyDecisionRecord>();

  campaigns = { get: async (id: string) => this.campaignMap.get(id) ?? null, save: async (record: CampaignRecord) => { this.campaignMap.set(record.id, record); } };
  metrics = { save: async (record: MetricsRecord) => { this.metricMap.set(record.id, record); }, list: async (campaignId: string) => [...this.metricMap.values()].filter((r) => r.campaignId === campaignId) };
  memories = { save: async (record: LearningMemoryRecord) => { this.memoryMap.set(record.id, record); }, list: async (campaignId?: string) => [...this.memoryMap.values()].filter((r) => !campaignId || r.campaignId === campaignId) };
  decisions = { save: async (record: StrategyDecisionRecord) => { this.decisionMap.set(record.id, record); }, list: async (campaignId?: string) => [...this.decisionMap.values()].filter((r) => !campaignId || r.campaignId === campaignId) };
}
