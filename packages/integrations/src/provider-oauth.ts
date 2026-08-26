export interface OAuthConfig { clientId: string; clientSecret: string; authorizeUrl: string; tokenUrl: string; scopes: string[]; }
export interface OAuthTokenResponse { access_token: string; refresh_token?: string; expires_in?: number; token_type?: string; scope?: string; }
export interface OAuthHttp { request<T>(input: { method: "GET" | "POST"; url: string; headers?: Record<string,string>; body?: unknown }): Promise<T>; }

export class GenericOAuthProvider {
  constructor(private readonly config: OAuthConfig, private readonly http: OAuthHttp) {}
  authorizationUrl(state: string, redirectUri: string): string {
    const q = new URLSearchParams({ client_id: this.config.clientId, redirect_uri: redirectUri, response_type: "code", scope: this.config.scopes.join(" "), state });
    return `${this.config.authorizeUrl}?${q.toString()}`;
  }
  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResponse> {
    return this.http.request<OAuthTokenResponse>({ method: "POST", url: this.config.tokenUrl, headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "authorization_code", code, client_id: this.config.clientId, client_secret: this.config.clientSecret, redirect_uri: redirectUri }).toString() });
  }
  async refresh(refreshToken: string): Promise<OAuthTokenResponse> {
    return this.http.request<OAuthTokenResponse>({ method: "POST", url: this.config.tokenUrl, headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: this.config.clientId, client_secret: this.config.clientSecret }).toString() });
  }
}
