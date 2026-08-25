export interface OAuthAuthorizationRequest { provider: string; accountId: string; redirectUri: string; state: string; scopes: string[]; }
export interface OAuthCallbackResult { provider: string; accountId: string; code: string; state: string; }

export interface ProviderOAuthClient {
  readonly provider: string;
  authorizationUrl(input: OAuthAuthorizationRequest): string;
  exchangeCode(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: number; scope?: string[] }>;
}

export class OAuthProviderRegistry {
  constructor(private readonly clients: Record<string, ProviderOAuthClient>) {}
  get(provider: string): ProviderOAuthClient {
    const client = this.clients[provider];
    if (!client) throw new Error(`Unsupported OAuth provider: ${provider}`);
    return client;
  }
}
