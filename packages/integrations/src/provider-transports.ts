export type Platform = "meta" | "tiktok" | "shopify";
export interface ProviderRequest { method: "GET" | "POST" | "PUT" | "DELETE"; path: string; body?: unknown; query?: Record<string,string|number|boolean>; }
export interface ProviderResponse<T = unknown> { status: number; data: T; nextPage?: string; }
export interface AccessToken { accessToken: string; expiresAt?: number; }
export interface TokenProvider { get(platform: Platform): Promise<AccessToken>; refresh(platform: Platform): Promise<AccessToken>; }
export interface HttpTransport { request<T>(input: { method: ProviderRequest["method"]; url: string; headers: Record<string,string>; body?: unknown }): Promise<ProviderResponse<T>>; }

export class ProviderTransport {
  constructor(private readonly platform: Platform, private readonly baseUrl: string, private readonly tokens: TokenProvider, private readonly http: HttpTransport) {}
  async request<T>(request: ProviderRequest): Promise<ProviderResponse<T>> {
    let token = await this.tokens.get(this.platform);
    const send = () => this.http.request<T>({ method: request.method, url: this.buildUrl(request), headers: { Authorization: `Bearer ${token.accessToken}`, "Content-Type": "application/json" }, body: request.body });
    let response = await send();
    if (response.status === 401) { token = await this.tokens.refresh(this.platform); response = await send(); }
    if (response.status === 429 || response.status >= 500) throw new Error(`Provider request retry required: ${this.platform} ${response.status}`);
    if (response.status >= 400) throw new Error(`Provider request failed: ${this.platform} ${response.status}`);
    return response;
  }
  private buildUrl(request: ProviderRequest) { const url = new URL(request.path.replace(/^\//, ""), this.baseUrl.endsWith("/") ? this.baseUrl : `${this.baseUrl}/`); for (const [k,v] of Object.entries(request.query ?? {})) url.searchParams.set(k, String(v)); return url.toString(); }
}

export class MetaTransport extends ProviderTransport { constructor(tokens: TokenProvider, http: HttpTransport, baseUrl: string) { super("meta", baseUrl, tokens, http); } }
export class TikTokTransport extends ProviderTransport { constructor(tokens: TokenProvider, http: HttpTransport, baseUrl: string) { super("tiktok", baseUrl, tokens, http); } }
export class ShopifyTransport extends ProviderTransport { constructor(tokens: TokenProvider, http: HttpTransport, baseUrl: string) { super("shopify", baseUrl, tokens, http); } }
