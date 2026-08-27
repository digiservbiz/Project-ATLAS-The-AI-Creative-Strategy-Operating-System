import type { OAuthTokenResponse } from "./provider-oauth";

export type Platform = "meta" | "tiktok" | "shopify";
export interface StoredCredential { platform: Platform; accessToken: string; refreshToken?: string; expiresAt?: string; scopes: string[]; accountId?: string; }
export interface CredentialStore { get(platform: Platform, accountId: string): Promise<StoredCredential | null>; save(credential: StoredCredential): Promise<void>; }
export interface PlatformTransport { request<T>(input: { platform: Platform; accessToken: string; method: "GET" | "POST"; path: string; body?: unknown }): Promise<T>; }
export interface TokenRefresher { refresh(platform: Platform, refreshToken: string): Promise<OAuthTokenResponse>; }

export class InMemoryCredentialStore implements CredentialStore {
  private readonly credentials = new Map<string, StoredCredential>();
  private key(platform: Platform, accountId: string) { return `${platform}:${accountId}`; }
  async get(platform: Platform, accountId: string) { return this.credentials.get(this.key(platform, accountId)) ?? null; }
  async save(c: StoredCredential) { if (!c.accessToken) throw new Error("Access token is required"); this.credentials.set(this.key(c.platform, c.accountId ?? "default"), c); }
}

export class PlatformGateway {
  constructor(private readonly credentials: CredentialStore, private readonly transport: PlatformTransport, private readonly refresher?: TokenRefresher) {}

  async request<T>(platform: Platform, accountId: string, input: { method: "GET" | "POST"; path: string; body?: unknown }): Promise<T> {
    const credential = await this.credentials.get(platform, accountId);
    if (!credential) throw new Error(`No credentials configured for ${platform}:${accountId}`);
    let active = credential;
    if (active.expiresAt && new Date(active.expiresAt).getTime() <= Date.now() + 60_000) {
      if (!active.refreshToken || !this.refresher) throw new Error(`Credentials expired for ${platform}:${accountId}`);
      const refreshed = await this.refresher.refresh(platform, active.refreshToken);
      active = { ...active, accessToken: refreshed.access_token, refreshToken: refreshed.refresh_token ?? active.refreshToken, expiresAt: refreshed.expires_in ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString() : active.expiresAt, scopes: refreshed.scope?.split(/\s+/).filter(Boolean) ?? active.scopes };
      await this.credentials.save(active);
    }
    return this.transport.request<T>({ ...input, platform, accessToken: active.accessToken });
  }
}
