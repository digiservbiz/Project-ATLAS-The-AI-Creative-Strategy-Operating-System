export interface ShopifyGraphQLRequest {
  shopDomain: string;
  accessToken: string;
  query: string;
  variables?: Record<string, unknown>;
}

export interface ShopifyHttpClient {
  post<T>(url: string, headers: Record<string, string>, body: Record<string, unknown>): Promise<T>;
}

export interface ShopifyAdminClientOptions {
  http: ShopifyHttpClient;
  apiVersion?: string;
}

export interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

function normalizeShopDomain(domain: string): string {
  const normalized = domain.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
  if (!normalized || normalized.includes("/")) throw new Error("A valid Shopify shop domain is required");
  return normalized;
}

export class ShopifyAdminClient {
  private readonly apiVersion: string;

  constructor(private readonly options: ShopifyAdminClientOptions) {
    this.apiVersion = options.apiVersion ?? "2026-07";
  }

  async query<T>(request: ShopifyGraphQLRequest): Promise<T> {
    const shopDomain = normalizeShopDomain(request.shopDomain);
    if (!request.accessToken.trim()) throw new Error("A Shopify access token is required");
    if (!request.query.trim()) throw new Error("A Shopify GraphQL query is required");

    const response = await this.options.http.post<ShopifyGraphQLResponse<T>>(
      `https://${shopDomain}/admin/api/${this.apiVersion}/graphql.json`,
      {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": request.accessToken,
      },
      { query: request.query, variables: request.variables ?? {} },
    );

    if (response.errors?.length) {
      throw new Error(`Shopify GraphQL error: ${response.errors.map((error) => error.message).join("; ")}`);
    }
    if (response.data === undefined) throw new Error("Shopify GraphQL response did not contain data");
    return response.data;
  }
}
