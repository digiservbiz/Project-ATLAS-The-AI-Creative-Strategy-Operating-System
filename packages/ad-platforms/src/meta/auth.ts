export interface TokenRecord {
  platform: "meta";
  organizationId: string;
  accountId: string;
  accessToken: string;
  expiresAt?: string;
  scopes: string[];
}

export interface TokenStore {
  get(organizationId: string, accountId: string): Promise<TokenRecord | undefined>;
  put(record: TokenRecord): Promise<void>;
  delete(organizationId: string, accountId: string): Promise<void>;
}

export class MetaAuthService {
  constructor(private readonly store: TokenStore) {}

  async requireToken(organizationId: string, accountId: string): Promise<TokenRecord> {
    const token = await this.store.get(organizationId, accountId);
    if (!token) throw new Error("Meta authorization is not configured");
    if (token.expiresAt && Date.parse(token.expiresAt) <= Date.now()) throw new Error("Meta authorization token has expired");
    if (!token.accessToken) throw new Error("Meta access token is empty");
    return token;
  }

  async revoke(organizationId: string, accountId: string): Promise<void> {
    await this.store.delete(organizationId, accountId);
  }
}
