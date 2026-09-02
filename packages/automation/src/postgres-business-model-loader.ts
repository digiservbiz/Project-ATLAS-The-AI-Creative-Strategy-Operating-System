import type { Database } from "@atlas/database";
import type {
  Audience,
  BusinessIntelligenceModel,
  BusinessModelType,
  Brand,
  Campaign,
  Competitor,
  Offer,
} from "@atlas/intelligence";
import type { AgentContext } from "@atlas/orchestrator";
import type { ProductionBusinessModelLoader } from "./intelligence-context-loader";

export interface BusinessModelScope {
  organizationId: string;
  projectId: string;
}

type ProfileRow = {
  id: string;
  name: string;
  model: BusinessModelType;
  description: string | null;
  markets: unknown;
  channels: unknown;
  audiences: unknown;
  competitors: unknown;
};

type BrandRow = {
  id: string;
  name: string;
  positioning: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number | string | null;
  currency: string | null;
  features: unknown;
  benefits: unknown;
  known_objections: unknown;
};

type CampaignRow = {
  id: string;
  channel: string;
  objective: string;
  product_id: string | null;
  audience_ids: unknown;
};

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const records = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => !!item && typeof item === "object" && !Array.isArray(item))
    : [];

/**
 * Loads the canonical business model using the authenticated tenant/project scope.
 * Every query includes both organization_id and project_id so a caller cannot
 * accidentally hydrate intelligence from another tenant's project.
 */
export class PostgresBusinessModelLoader implements ProductionBusinessModelLoader {
  constructor(private readonly database: Database) {}

  async load(context: AgentContext): Promise<BusinessIntelligenceModel | null> {
    if (!context.organizationId) throw new Error("organizationId is required");
    if (!context.projectId) throw new Error("projectId is required for production intelligence");

    const scope: BusinessModelScope = {
      organizationId: context.organizationId,
      projectId: context.projectId,
    };

    const profiles = await this.database.query<ProfileRow>(
      `SELECT id,name,model,description,markets,channels,audiences,competitors
       FROM business_profiles
       WHERE id = $1 AND organization_id = $2 AND project_id = $3
       LIMIT 1`,
      [scope.projectId, scope.organizationId, scope.projectId],
    );

    // The profile id is normally the project id in the initial production schema.
    // Fall back to the tenant-scoped project row when a profile has not been
    // provisioned yet; this keeps existing projects loadable after migration.
    const profile = profiles[0] ?? (await this.database.query<ProfileRow & { id: string }>(
      `SELECT p.id,p.name,'other'::text AS model,NULL::text AS description,
              '[]'::jsonb AS markets,'[]'::jsonb AS channels,
              '[]'::jsonb AS audiences,'[]'::jsonb AS competitors
       FROM projects p
       WHERE p.id = $1 AND p.organization_id = $2
       LIMIT 1`,
      [scope.projectId, scope.organizationId],
    ))[0];

    if (!profile) return null;

    const [brandRows, productRows, campaignRows] = await Promise.all([
      this.database.query<BrandRow>(
        `SELECT id,name,COALESCE(industry, market) AS positioning
         FROM brands
         WHERE organization_id=$1 AND project_id=$2
         ORDER BY created_at ASC`,
        [scope.organizationId, scope.projectId],
      ),
      this.database.query<ProductRow>(
        `SELECT id,name,description,price,currency,features,benefits,known_objections
         FROM products
         WHERE organization_id=$1 AND project_id=$2
         ORDER BY created_at ASC`,
        [scope.organizationId, scope.projectId],
      ),
      this.database.query<CampaignRow>(
        `SELECT id,channel,objective,product_id,'[]'::jsonb AS audience_ids
         FROM campaigns
         WHERE organization_id=$1 AND project_id=$2
         ORDER BY created_at ASC`,
        [scope.organizationId, scope.projectId],
      ),
    ]);

    const brands: Brand[] = brandRows.map((row) => ({
      id: row.id,
      businessId: profile.id,
      name: row.name,
      positioning: row.positioning ?? undefined,
    }));

    const brandIds = brands.map((brand) => brand.id);
    const offers: Offer[] = productRows.map((row) => ({
      id: row.id,
      businessId: profile.id,
      name: row.name,
      type: "product",
      valueProposition: row.description,
      price: row.price == null ? undefined : Number(row.price),
      currency: row.currency ?? undefined,
    }));

    const audiences: Audience[] = records(profile.audiences).map((row, index) => ({
      id: typeof row.id === "string" ? row.id : `${profile.id}:audience:${index + 1}`,
      businessId: profile.id,
      name: typeof row.name === "string" ? row.name : `Audience ${index + 1}`,
      problems: strings(row.problems),
      desires: strings(row.desires),
      objections: strings(row.objections),
      awarenessLevel: typeof row.awarenessLevel === "string" ? row.awarenessLevel : undefined,
      purchaseIntent: typeof row.purchaseIntent === "string" ? row.purchaseIntent : undefined,
    }));

    const competitors: Competitor[] = records(profile.competitors).map((row, index) => ({
      id: typeof row.id === "string" ? row.id : `${profile.id}:competitor:${index + 1}`,
      businessId: profile.id,
      name: typeof row.name === "string" ? row.name : `Competitor ${index + 1}`,
      positioning: typeof row.positioning === "string" ? row.positioning : undefined,
      offerIds: strings(row.offerIds),
    }));

    const campaigns: Campaign[] = campaignRows.map((row) => ({
      id: row.id,
      businessId: profile.id,
      channel: row.channel,
      objective: row.objective,
      offerId: row.product_id ?? undefined,
      audienceIds: strings(row.audience_ids),
    }));

    return {
      business: {
        id: profile.id,
        name: profile.name,
        model: profile.model,
        description: profile.description ?? undefined,
        markets: strings(profile.markets),
        channels: strings(profile.channels),
        brandIds,
      },
      brands,
      offers,
      audiences,
      competitors,
      campaigns,
    };
  }
}
