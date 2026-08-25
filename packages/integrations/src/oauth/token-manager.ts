export interface OAuthToken { accessToken: string; refreshToken?: string; expiresAt?: number; scope?: string[]; provider: string; accountId: string; }
export interface OAuthProvider { refresh(refreshToken: string): Promise<OAuthToken>; }
export interface SecretStore { get(key: string): Promise<string | null>; set(key: string, value: string): Promise<void>; delete?(key: string): Promise<void>; }

export class OAuthTokenManager {
  constructor(private readonly secrets: SecretStore, private readonly providers: Record<string, OAuthProvider>, private readonly refreshSkewMs = 60_000) {}

  async get(provider: string, accountId: string): Promise<OAuthToken | null> {
    const raw = await this.secrets.get(this.key(provider, accountId));
    if (!raw) return null;
    const token = JSON.parse(raw) as OAuthToken;
    if (!token.expiresAt || token.expiresAt - Date.now() > this.refreshSkewMs) return token;
    if (!token.refreshToken) return token;
    const refreshed = await this.refresh(provider, token.refreshToken);
    await this.save(refreshed);
    return refreshed;
  }

  async save(token: OAuthToken): Promise<void> {
    await this.secrets.set(this.key(token.provider, token.accountId), JSON.stringify(token));
  }

  async refresh(provider: string, refreshToken: string): Promise<OAuthToken> {
    const client = this.providers[provider];
    if (!client) throw new Error(`Unsupported OAuth provider: ${provider}`);
    return client.refresh(refreshToken);
  }

  private key(provider: string, accountId: string) { return `atlas:oauth:${provider}:${accountId}`; }
}
