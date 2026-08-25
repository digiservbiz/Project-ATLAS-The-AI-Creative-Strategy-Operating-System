export interface CampaignRecord { id: string; version: number; payload: Record<string, unknown>; updatedAt: string; }
export interface MetricRecord { id: string; campaignId: string; payload: Record<string, unknown>; collectedAt: string; }
export interface LearningRecord { id: string; campaignId: string; payload: Record<string, unknown>; createdAt: string; }

export interface CampaignRepository { get(id: string): Promise<CampaignRecord | null>; save(record: CampaignRecord): Promise<void>; history(id: string): Promise<CampaignRecord[]>; }
export interface MetricsRepository { save(record: MetricRecord): Promise<void>; list(campaignId: string): Promise<MetricRecord[]>; }
export interface LearningRepository { save(record: LearningRecord): Promise<void>; search(campaignId: string, limit?: number): Promise<LearningRecord[]>; }

export interface AtlasPersistence {
  campaigns: CampaignRepository;
  metrics: MetricsRepository;
  learning: LearningRepository;
}

export class InMemoryAtlasPersistence implements AtlasPersistence {
  readonly campaigns: CampaignRepository = new MemoryCampaignRepository();
  readonly metrics: MetricsRepository = new MemoryMetricsRepository();
  readonly learning: LearningRepository = new MemoryLearningRepository();
}

class MemoryCampaignRepository implements CampaignRepository {
  private current = new Map<string, CampaignRecord>();
  private versions = new Map<string, CampaignRecord[]>();
  async get(id: string) { return this.current.get(id) ?? null; }
  async save(record: CampaignRecord) { this.current.set(record.id, record); const history = this.versions.get(record.id) ?? []; history.push(record); this.versions.set(record.id, history); }
  async history(id: string) { return [...(this.versions.get(id) ?? [])]; }
}

class MemoryMetricsRepository implements MetricsRepository {
  private rows: MetricRecord[] = [];
  async save(record: MetricRecord) { this.rows.push(record); }
  async list(campaignId: string) { return this.rows.filter((row) => row.campaignId === campaignId); }
}

class MemoryLearningRepository implements LearningRepository {
  private rows: LearningRecord[] = [];
  async save(record: LearningRecord) { this.rows.push(record); }
  async search(campaignId: string, limit = 20) { return this.rows.filter((row) => row.campaignId === campaignId).slice(-limit).reverse(); }
}
