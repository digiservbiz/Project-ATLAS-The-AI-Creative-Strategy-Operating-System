import type { PlatformResponse } from "./platform-transports";
import type { CampaignCreateInput, CreativeCreateInput, MetricsQuery } from "./provider-operations";

export interface ProviderPayloadMapper { campaign(input: CampaignCreateInput): unknown; creative(input: CreativeCreateInput): unknown; metrics(input: MetricsQuery): Record<string,string>; }

export const metaMapper: ProviderPayloadMapper = {
  campaign: (i) => ({ name: i.name, objective: i.objective, daily_budget: i.dailyBudget, currency: i.currency, status: i.status ?? "PAUSED" }),
  creative: (i) => ({ name: i.name, image_url: i.mediaUrl, body: i.copy, link_url: i.destinationUrl }),
  metrics: (i) => ({ account_id: i.accountId, since: i.startDate, until: i.endDate, ...(i.cursor ? { after: i.cursor } : {}) }),
};

export const tiktokMapper: ProviderPayloadMapper = {
  campaign: (i) => ({ campaign_name: i.name, objective_type: i.objective, budget_mode: "BUDGET_MODE_DAY", budget: i.dailyBudget, currency: i.currency, operation_status: i.status ?? "DISABLE" }),
  creative: (i) => ({ ad_name: i.name, image_url: i.mediaUrl, ad_text: i.copy, landing_page_url: i.destinationUrl }),
  metrics: (i) => ({ advertiser_id: i.accountId, start_date: i.startDate, end_date: i.endDate, ...(i.cursor ? { page: i.cursor } : {}) }),
};

export const shopifyMapper: ProviderPayloadMapper = {
  campaign: (i) => ({ title: i.name, objective: i.objective, status: i.status ?? "PAUSED" }),
  creative: (i) => ({ title: i.name, image: { src: i.mediaUrl }, body_html: i.copy, handle: i.destinationUrl }),
  metrics: (i) => ({ account_id: i.accountId, start_date: i.startDate, end_date: i.endDate, ...(i.cursor ? { cursor: i.cursor } : {}) }),
};

export function assertProviderSuccess<T>(platform: string, response: PlatformResponse<T>): T {
  if (response.status < 200 || response.status >= 300) throw new Error(`${platform} provider returned HTTP ${response.status}`);
  return response.data;
}
