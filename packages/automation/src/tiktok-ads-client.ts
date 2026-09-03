export interface TikTokInsightsRequest {
  accessToken: string;
  advertiserId: string;
  reportType?: string;
  dataLevel?: "AUCTION_AD" | "AUCTION_ADGROUP" | "AUCTION_CAMPAIGN";
  dimensions?: string[];
  metrics?: string[];
  startDate: string;
  endDate: string;
  pageSize?: number;
}

export interface TikTokInsightsPage<T = Record<string, unknown>> {
  data: T[];
  pageInfo?: { page?: number; pageSize?: number; totalPage?: number; totalNumber?: number };
}

export interface TikTokHttpClient {
  post<T>(url: string, body: Record<string, unknown>, headers: Record<string, string>): Promise<T>;
}

export interface TikTokInsightsClientOptions {
  http: TikTokHttpClient;
  baseUrl?: string;
}

const DEFAULT_METRICS = ["impressions", "clicks", "spend", "conversion", "purchase", "purchase_value"];

function assertDate(value: string, name: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${name} must use YYYY-MM-DD format`);
}

export class TikTokAdsClient {
  private readonly baseUrl: string;

  constructor(private readonly options: TikTokInsightsClientOptions) {
    this.baseUrl = (options.baseUrl ?? "https://business-api.tiktok.com").replace(/\/$/, "");
  }

  async fetch(request: TikTokInsightsRequest): Promise<TikTokInsightsPage> {
    this.validate(request);
    const body = {
      advertiser_id: request.advertiserId.trim(),
      report_type: request.reportType ?? "BASIC",
      data_level: request.dataLevel ?? "AUCTION_AD",
      dimensions: request.dimensions ?? ["ad_id", "stat_time_day"],
      metrics: request.metrics?.length ? request.metrics : DEFAULT_METRICS,
      start_date: request.startDate,
      end_date: request.endDate,
      page_size: request.pageSize ?? 100,
      page: 1,
    };
    return this.options.http.post<TikTokInsightsPage>(
      `${this.baseUrl}/open_api/v1.3/report/integrated/get/`,
      body,
      { "Access-Token": request.accessToken },
    );
  }

  private validate(request: TikTokInsightsRequest): void {
    if (!request.accessToken.trim()) throw new Error("TikTok access token is required");
    if (!request.advertiserId.trim()) throw new Error("TikTok advertiser ID is required");
    assertDate(request.startDate, "startDate");
    assertDate(request.endDate, "endDate");
    if (request.startDate > request.endDate) throw new Error("startDate cannot be after endDate");
    if (request.pageSize !== undefined && (!Number.isInteger(request.pageSize) || request.pageSize < 1 || request.pageSize > 1000)) {
      throw new Error("TikTok pageSize must be an integer between 1 and 1000");
    }
  }
}
