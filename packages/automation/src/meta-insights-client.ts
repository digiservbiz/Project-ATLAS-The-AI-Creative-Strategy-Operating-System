export interface MetaInsightsRequest {
  accessToken: string;
  adAccountId: string;
  fields?: string[];
  dateStart: string;
  dateStop: string;
  level?: "ad" | "adset" | "campaign";
  limit?: number;
}

export interface MetaInsightsPage<T = Record<string, unknown>> {
  data: T[];
  paging?: {
    next?: string;
    cursors?: { before?: string; after?: string };
  };
}

export interface MetaHttpClient {
  get<T>(url: string, params: Record<string, string>): Promise<T>;
}

export interface MetaInsightsClientOptions {
  http: MetaHttpClient;
  apiVersion?: string;
  baseUrl?: string;
}

const DEFAULT_FIELDS = [
  "ad_id",
  "creative_id",
  "date_start",
  "date_stop",
  "impressions",
  "clicks",
  "spend",
  "actions",
  "action_values",
];

function assertDate(value: string, name: string): void {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) throw new Error(`${name} must use YYYY-MM-DD format`);
}

function accountPath(id: string): string {
  const normalized = id.trim();
  if (!normalized) throw new Error("Meta ad account ID is required");
  return normalized.startsWith("act_") ? normalized : `act_${normalized}`;
}

/**
 * Provider boundary for Meta Ads Insights. Authentication is supplied by the caller;
 * the client never persists or logs access tokens and returns provider responses unchanged.
 */
export class MetaInsightsClient {
  private readonly baseUrl: string;
  private readonly apiVersion: string;

  constructor(private readonly options: MetaInsightsClientOptions) {
    this.baseUrl = (options.baseUrl ?? "https://graph.facebook.com").replace(/\\/$/, "");
    this.apiVersion = options.apiVersion ?? "v23.0";
  }

  async fetch(request: MetaInsightsRequest): Promise<MetaInsightsPage> {
    this.validate(request);
    const params: Record<string, string> = {
      access_token: request.accessToken,
      fields: (request.fields?.length ? request.fields : DEFAULT_FIELDS).join(","),
      time_range: JSON.stringify({ since: request.dateStart, until: request.dateStop }),
      level: request.level ?? "ad",
      limit: String(request.limit ?? 100),
    };
    return this.options.http.get<MetaInsightsPage>(
      `${this.baseUrl}/${this.apiVersion}/${accountPath(request.adAccountId)}/insights`,
      params,
    );
  }

  private validate(request: MetaInsightsRequest): void {
    if (!request.accessToken.trim()) throw new Error("Meta access token is required");
    assertDate(request.dateStart, "dateStart");
    assertDate(request.dateStop, "dateStop");
    if (request.dateStart > request.dateStop) throw new Error("dateStart cannot be after dateStop");
    if (request.limit !== undefined && (!Number.isInteger(request.limit) || request.limit < 1 || request.limit > 500)) {
      throw new Error("Meta Insights limit must be an integer between 1 and 500");
    }
  }
}
