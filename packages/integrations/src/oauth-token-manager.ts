export interface OAuthToken { accessToken: string; refreshToken?: string; expiresAt?: number; tokenType?: string; scope?: string[]; }
export interface OAuthProvider { refresh(input: { refreshToken: string }): Promise<OAuthToken>; }
export interface TokenStore { get(key: string): Promise<OAuthToken | null>; save(key: string, token: OAuthToken): Promise<void>; }

export class InMemoryTokenStore implements TokenStore {
  private readonly tokens = new Map<string, OAuthToken>();
  async get(key: string): Promise<OAuthToken | null> { return this.tokens.get(key) ?? null; }
  async save(key: string, token: OAuthToken): Promise<void> { this.tokens.set(key, token); }
}

export class OAuthTokenManager {
  constructor(private readonly store: TokenStore, private readonly providers: Record<string, OAuthProvider>, private readonly refreshSkewMs = 60_000) {}
  async getValid(provider: string, key: string): Promise<OAuthToken> {
    const token = await this.store.get(key);
    if (!token) throw new Error(`No OAuth token configured for ${provider}:${key}`);
    if (!token.expiresAt || token.expiresAt - Date.now() > this.refreshSkewMs) return token;
    if (!token.refreshToken) throw new Error(`OAuth token expired and no refresh token exists for ${provider}:${key}`);
    const client = this.providers[provider];
    if (!client) throw new Error(`No OAuth provider registered: ${provider}`);
    const refreshed = await client.refresh({ refreshToken: token.refreshToken });
    await this.store.save(key, { ...token, ...refreshed, refreshToken: refreshed.refreshToken ?? token.refreshToken });
    return this.store.get(key).then((saved) => saved as OAuthToken);
  }
}
