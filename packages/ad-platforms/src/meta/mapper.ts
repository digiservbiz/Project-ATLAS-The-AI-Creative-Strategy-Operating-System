import type { NormalizedAd, NormalizedAdSet, NormalizedCampaign, NormalizedCreative } from "../normalized-model";

export interface MetaCampaignPayload { id: string; name?: string; status?: string; objective?: string; daily_budget?: string | number; currency?: string; [key: string]: unknown }
export interface MetaAdSetPayload { id: string; campaign_id: string; name?: string; status?: string; targeting?: Record<string, unknown>; [key: string]: unknown }
export interface MetaAdPayload { id: string; adset_id?: string; campaign_id: string; name?: string; status?: string; creative?: { id?: string }; [key: string]: unknown }
export interface MetaCreativePayload { id: string; name?: string; body?: string; title?: string; description?: string; image_url?: string; video_url?: string; link_url?: string; [key: string]: unknown }

const status = (value?: string) => value?.toLowerCase() ?? "unknown";

export function mapMetaCampaign(payload: MetaCampaignPayload, organizationId: string, accountId: string): NormalizedCampaign {
  return { platform: "meta", organizationId, accountId, campaignId: payload.id, name: payload.name ?? payload.id, status: status(payload.status), objective: payload.objective, dailyBudget: payload.daily_budget == null ? undefined : Number(payload.daily_budget) / 100, currency: payload.currency, raw: payload };
}

export function mapMetaAdSet(payload: MetaAdSetPayload, organizationId: string, accountId: string): NormalizedAdSet {
  return { platform: "meta", organizationId, accountId, campaignId: payload.campaign_id, adSetId: payload.id, name: payload.name ?? payload.id, status: status(payload.status), targeting: payload.targeting, raw: payload };
}

export function mapMetaAd(payload: MetaAdPayload, organizationId: string, accountId: string): NormalizedAd {
  return { platform: "meta", organizationId, accountId, campaignId: payload.campaign_id, adSetId: payload.adset_id, adId: payload.id, name: payload.name ?? payload.id, status: status(payload.status), creativeId: payload.creative?.id, raw: payload };
}

export function mapMetaCreative(payload: MetaCreativePayload, organizationId: string, accountId: string): NormalizedCreative {
  return { platform: "meta", organizationId, accountId, creativeId: payload.id, name: payload.name, primaryText: payload.body, headline: payload.title, description: payload.description, mediaUrls: [payload.image_url, payload.video_url].filter((value): value is string => Boolean(value)), landingPageUrl: payload.link_url, raw: payload };
}
