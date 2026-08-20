import type { CreativeArtifact, CreativeArtifactStore } from "@atlas/contracts";
import type { Database } from "@atlas/database";

export class PgCreativeArtifactStore implements CreativeArtifactStore {
  constructor(private readonly database: Database) {}

  async upsert(artifact: CreativeArtifact): Promise<void> {
    await this.database.query(
      `INSERT INTO creative_artifacts
        (id, organization_id, source, source_id, captured_at, advertiser_name, market,
         platform, title, primary_text, headline, description, call_to_action,
         landing_page_url, media_urls, language, first_seen_at, last_seen_at, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::jsonb)
       ON CONFLICT (organization_id, source, source_id) DO UPDATE SET
         id = EXCLUDED.id,
         captured_at = EXCLUDED.captured_at,
         advertiser_name = EXCLUDED.advertiser_name,
         market = EXCLUDED.market,
         platform = EXCLUDED.platform,
         title = EXCLUDED.title,
         primary_text = EXCLUDED.primary_text,
         headline = EXCLUDED.headline,
         description = EXCLUDED.description,
         call_to_action = EXCLUDED.call_to_action,
         landing_page_url = EXCLUDED.landing_page_url,
         media_urls = EXCLUDED.media_urls,
         language = EXCLUDED.language,
         first_seen_at = EXCLUDED.first_seen_at,
         last_seen_at = EXCLUDED.last_seen_at,
         metadata = EXCLUDED.metadata`,
      [
        artifact.id,
        artifact.organizationId,
        artifact.source.source,
        artifact.source.sourceId,
        artifact.source.capturedAt,
        artifact.source.advertiserName ?? null,
        artifact.source.market ?? null,
        artifact.source.platform ?? null,
        artifact.title ?? null,
        artifact.primaryText ?? null,
        artifact.headline ?? null,
        artifact.description ?? null,
        artifact.callToAction ?? null,
        artifact.landingPageUrl ?? null,
        artifact.mediaUrls ?? [],
        artifact.language ?? null,
        artifact.firstSeenAt ?? null,
        artifact.lastSeenAt ?? null,
        JSON.stringify(artifact.metadata ?? {}),
      ],
    );
  }

  async findBySource(source: string, sourceId: string): Promise<CreativeArtifact | null> {
    const rows = await this.database.query<CreativeArtifactRow>(
      `SELECT id, organization_id, source, source_id, captured_at, advertiser_name, market,
              platform, title, primary_text, headline, description, call_to_action,
              landing_page_url, media_urls, language, first_seen_at, last_seen_at, metadata
       FROM creative_artifacts
       WHERE source = $1 AND source_id = $2
       LIMIT 1`,
      [source, sourceId],
    );
    return rows[0] ? toArtifact(rows[0]) : null;
  }
}

interface CreativeArtifactRow {
  id: string;
  organization_id: string;
  source: CreativeArtifact["source"]["source"];
  source_id: string;
  captured_at: string;
  advertiser_name: string | null;
  market: string | null;
  platform: CreativeArtifact["source"]["platform"] | null;
  title: string | null;
  primary_text: string | null;
  headline: string | null;
  description: string | null;
  call_to_action: string | null;
  landing_page_url: string | null;
  media_urls: string[] | null;
  language: string | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
  metadata: Record<string, unknown>;
}

function toArtifact(row: CreativeArtifactRow): CreativeArtifact {
  return {
    id: row.id,
    organizationId: row.organization_id,
    source: {
      source: row.source,
      sourceId: row.source_id,
      capturedAt: row.captured_at,
      advertiserName: row.advertiser_name ?? undefined,
      market: row.market ?? undefined,
      platform: row.platform ?? undefined,
    },
    title: row.title ?? undefined,
    primaryText: row.primary_text ?? undefined,
    headline: row.headline ?? undefined,
    description: row.description ?? undefined,
    callToAction: row.call_to_action ?? undefined,
    landingPageUrl: row.landing_page_url ?? undefined,
    mediaUrls: row.media_urls ?? undefined,
    language: row.language ?? undefined,
    firstSeenAt: row.first_seen_at ?? undefined,
    lastSeenAt: row.last_seen_at ?? undefined,
    metadata: row.metadata ?? {},
  };
}
