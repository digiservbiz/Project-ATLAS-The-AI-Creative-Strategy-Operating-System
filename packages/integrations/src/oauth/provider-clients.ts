import type { OAuthAuthorizationRequest, ProviderOAuthClient } from "./oauth/provider-oauth";
import type { OAuthToken } from "./oauth/token-manager";

export interface OAuthHttpClient {
  request<T>(input: { method: "GET" | "POST"; url: string; headers?: Record<string, string>; query?: Record<string, string>; body?: string }): Promise<{ data: T; status: number; headers?: Record<string, string> }>;
}

interface TokenResponse { access_token: string; refresh_token?: string; expires_in?: number; scope?: string | string[]; }

abstract class BaseProviderClient implements ProviderOAuthClient {
  abstract readonly provider: string;
  constructor(protected readonly http: OAuthHttpClient) {}
  protected token(result: TokenResponse, accountId = "oauth") : OAuthToken & { accountId: string; provider: string } {
    return { accessToken: result.access_token, refreshToken: result.refresh_token, expiresAt: result.expires_in ? Date.now() + result.expires_in * 1000 : undefined, scope: Array.isArray(result.scope) ? result.scope : result.scope?.split(" ").filter(Boolean), provider: this.provider, accountId };
  }
  protected async postToken(url: string, body: Record<string, string>): Promise<TokenResponse> {
    const response = await this.http.request<TokenResponse>({ method: "POST", url, headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body).toString() });
    if (response.status >= 400) throw new Error(`${this.provider} OAuth token exchange failed (${response.status})`);
    return response.data;
  }
}

export class MetaOAuthClient extends BaseProviderClient {
  readonly provider = "meta" as const;
  constructor(http: OAuthHttpClient, private readonly clientId: string, private readonly clientSecret: string, private readonly graphVersion = "v23.0") { super(http); }
  authorizationUrl(input: OAuthAuthorizationRequest) {
    const url = new URL(`https://www.facebook.com/${this.graphVersion}/dialog/oauth`);
    url.searchParams.set("client_id", this.clientId); url.searchParams.set("redirect_uri", input.redirectUri); url.searchParams.set("state", input.state); url.searchParams.set("scope", input.scopes.join(",")); return url.toString();
  }
  async exchangeCode(code: string, redirectUri: string) {
    const url = new URL(`https://graph.facebook.com/${this.graphVersion}/oauth/access_token`);
    url.searchParams.set("client_id", this.clientId); url.searchParams.set("client_secret", this.clientSecret); url.searchParams.set("redirect_uri", redirectUri); url.searchParams.set("code", code);
    const response = await this.http.request<TokenResponse>({ method: "GET", url: url.toString() });
    if (response.status >= 400) throw new Error(`Meta OAuth code exchange failed (${response.status})`);
    return this.token(response.data);
  }
  async refresh(refreshToken: string) {
    const url = new URL(`https://graph.facebook.com/${this.graphVersion}/oauth/access_token`);
    url.searchParams.set("grant_type", "fb_exchange_token"); url.searchParams.set("client_id", this.clientId); url.searchParams.set("client_secret", this.clientSecret); url.searchParams.set("fb_exchange_token", refreshToken);
    const response = await this.http.request<TokenResponse>({ method: "GET", url: url.toString() });
    if (response.status >= 400) throw new Error(`Meta token refresh/exchange failed (${response.status})`);
    return this.token(response.data);
  }
}

export class TikTokOAuthClient extends BaseProviderClient {
  readonly provider = "tiktok" as const;
  constructor(http: OAuthHttpClient, private readonly clientKey: string, private readonly clientSecret: string, private readonly authBase = "https://www.tiktok.com/v2/auth/authorize/", private readonly tokenUrl = "https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/") { super(http); }
  authorizationUrl(input: OAuthAuthorizationRequest) {
    const url = new URL(this.authBase); url.searchParams.set("client_key", this.clientKey); url.searchParams.set("response_type", "code"); url.searchParams.set("redirect_uri", input.redirectUri); url.searchParams.set("state", input.state); url.searchParams.set("scope", input.scopes.join(",")); return url.toString();
  }
  async exchangeCode(code: string, redirectUri: string) {
    const data = await this.postToken(this.tokenUrl, { client_key: this.clientKey, client_secret: this.clientSecret, code, grant_type: "authorization_code", redirect_uri: redirectUri });
    return this.token(data);
  }
  async refresh(refreshToken: string) {
    const data = await this.postToken(this.tokenUrl, { client_key: this.clientKey, client_secret: this.clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" });
    return this.token(data);
  }
}

export class ShopifyOAuthClient extends BaseProviderClient {
  readonly provider = "shopify" as const;
  constructor(http: OAuthHttpClient, private readonly clientId: string, private readonly clientSecret: string, private readonly shopDomain: string) { super(http); }
  authorizationUrl(input: OAuthAuthorizationRequest) {
    const url = new URL(`https://${this.shopDomain}/admin/oauth/authorize`); url.searchParams.set("client_id", this.clientId); url.searchParams.set("scope", input.scopes.join(",")); url.searchParams.set("redirect_uri", input.redirectUri); url.searchParams.set("state", input.state); return url.toString();
  }
  async exchangeCode(code: string, _redirectUri: string) {
    const data = await this.postToken(`https://${this.shopDomain}/admin/oauth/access_token`, { client_id: this.clientId, client_secret: this.clientSecret, code });
    return this.token(data);
  }
  async refresh(_refreshToken: string) { throw new Error("Shopify offline access tokens do not use a refresh-token flow; reauthorize if the stored token is invalidated."); }
}
