import type { CampaignRecord, CampaignRepository, LearningRecord, LearningRepository, MetricRecord, MetricsRepository } from "./persistence-ports.js";

export interface PostgresClient {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export class PostgresCampaignRepository implements CampaignRepository {
  constructor(private readonly db: PostgresClient) {}
  async get(id: string) { const r = await this.db.query<CampaignRecord>("SELECT id, version, payload, updated_at AS \"updatedAt\" FROM atlas_campaigns WHERE id=$1 ORDER BY version DESC LIMIT 1", [id]); return r.rows[0] ?? null; }
  async save(record: CampaignRecord) { await this.db.query("INSERT INTO atlas_campaigns (id, version, payload, updated_at) VALUES ($1,$2,$3,$4)", [record.id, record.version, JSON.stringify(record.payload), record.updatedAt]); }
  async history(id: string) { const r = await this.db.query<CampaignRecord>("SELECT id, version, payload, updated_at AS \"updatedAt\" FROM atlas_campaigns WHERE id=$1 ORDER BY version ASC", [id]); return r.rows; }
}

export class PostgresMetricsRepository implements MetricsRepository {
  constructor(private readonly db: PostgresClient) {}
  async save(record: MetricRecord) { await this.db.query("INSERT INTO atlas_metrics (id, campaign_id, payload, collected_at) VALUES ($1,$2,$3,$4)", [record.id, record.campaignId, JSON.stringify(record.payload), record.collectedAt]); }
  async list(campaignId: string) { const r = await this.db.query<MetricRecord>("SELECT id, campaign_id AS \"campaignId\", payload, collected_at AS \"collectedAt\" FROM atlas_metrics WHERE campaign_id=$1 ORDER BY collected_at DESC", [campaignId]); return r.rows; }
}

export class PostgresLearningRepository implements LearningRepository {
  constructor(private readonly db: PostgresClient) {}
  async save(record: LearningRecord) { await this.db.query("INSERT INTO atlas_learning (id, campaign_id, payload, created_at) VALUES ($1,$2,$3,$4)", [record.id, record.campaignId, JSON.stringify(record.payload), record.createdAt]); }
  async search(campaignId: string, limit = 20) { const r = await this.db.query<LearningRecord>("SELECT id, campaign_id AS \"campaignId\", payload, created_at AS \"createdAt\" FROM atlas_learning WHERE campaign_id=$1 ORDER BY created_at DESC LIMIT $2", [campaignId, limit]); return r.rows; }
}

export class PostgresTransaction {
  constructor(private readonly db: PostgresClient) {}
  async begin() { await this.db.query("BEGIN"); }
  async commit() { await this.db.query("COMMIT"); }
  async rollback() { await this.db.query("ROLLBACK"); }
  async run<T>(work: () => Promise<T>): Promise<T> {
    await this.begin();
    try { const result = await work(); await this.commit(); return result; }
    catch (error) { await this.rollback(); throw error; }
  }
}
