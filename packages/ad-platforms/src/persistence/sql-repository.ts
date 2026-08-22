import type { AdPlatformRepository } from "./repository";
import type { NormalizedAd, NormalizedAdSet, NormalizedCampaign, NormalizedCreative } from "../normalized-model";
import type { CampaignMetricSnapshot } from "@atlas/performance-intelligence";

export interface SqlExecutor {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
}

export class SqlAdPlatformRepository implements AdPlatformRepository {
  constructor(private readonly db: SqlExecutor) {}

  async upsertCampaign(value: NormalizedCampaign): Promise<void> {
    await this.db.query(`INSERT INTO campaigns (organization_id, platform, account_id, campaign_id, name, status, objective, daily_budget, currency, raw) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (organization_id, platform, campaign_id) DO UPDATE SET name=EXCLUDED.name,status=EXCLUDED.status,objective=EXCLUDED.objective,daily_budget=EXCLUDED.daily_budget,currency=EXCLUDED.currency,raw=EXCLUDED.raw`, [value.organizationId, value.platform, value.accountId, value.campaignId, value.name, value.status, value.objective ?? null, value.dailyBudget ?? null, value.currency ?? null, JSON.stringify(value.raw ?? {})]);
  }

  async upsertAdSet(value: NormalizedAdSet): Promise<void> {
    await this.db.query(`INSERT INTO ad_sets (organization_id, platform, account_id, campaign_id, ad_set_id, name, status, targeting, raw) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (organization_id, platform, ad_set_id) DO UPDATE SET name=EXCLUDED.name,status=EXCLUDED.status,targeting=EXCLUDED.targeting,raw=EXCLUDED.raw`, [value.organizationId, value.platform, value.accountId, value.campaignId, value.adSetId, value.name, value.status, JSON.stringify(value.targeting ?? {}), JSON.stringify(value.raw ?? {})]);
  }

  async upsertAd(value: NormalizedAd): Promise<void> {
    await this.db.query(`INSERT INTO ads (organization_id, platform, account_id, campaign_id, ad_set_id, ad_id, name, status, creative_id, raw) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (organization_id, platform, ad_id) DO UPDATE SET name=EXCLUDED.name,status=EXCLUDED.status,creative_id=EXCLUDED.creative_id,raw=EXCLUDED.raw`, [value.organizationId, value.platform, value.accountId, value.campaignId, value.adSetId ?? null, value.adId, value.name, value.status, value.creativeId ?? null, JSON.stringify(value.raw ?? {})]);
  }

  async upsertCreative(value: NormalizedCreative): Promise<void> {
    await this.db.query(`INSERT INTO creatives (organization_id, platform, account_id, creative_id, name, primary_text, headline, description, media_urls, landing_page_url, raw) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (organization_id, platform, creative_id) DO UPDATE SET name=EXCLUDED.name,primary_text=EXCLUDED.primary_text,headline=EXCLUDED.headline,description=EXCLUDED.description,media_urls=EXCLUDED.media_urls,landing_page_url=EXCLUDED.landing_page_url,raw=EXCLUDED.raw`, [value.organizationId, value.platform, value.accountId, value.creativeId, value.name ?? null, value.primaryText ?? null, value.headline ?? null, value.description ?? null, JSON.stringify(value.mediaUrls ?? []), value.landingPageUrl ?? null, JSON.stringify(value.raw ?? {})]);
  }

  async appendPerformance(value: CampaignMetricSnapshot): Promise<void> {
    await this.db.query(`INSERT INTO performance_snapshots (organization_id, platform, campaign_id, ad_id, recorded_at, impressions, clicks, spend, conversions, revenue) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [value.organizationId, value.platform, value.campaignId, value.adId ?? null, value.timestamp, value.impressions ?? null, value.clicks ?? null, value.spend ?? null, value.conversions ?? null, value.revenue ?? null]);
  }
}
