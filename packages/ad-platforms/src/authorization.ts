import type { AdPlatform, OAuthAuthorization, PlatformApiClient } from "./contracts";

export class PlatformAuthorizationRegistry {
  private readonly clients = new Map<AdPlatform, PlatformApiClient>();

  register(client: PlatformApiClient): void {
    this.clients.set(client.platform, client);
  }

  async requireAuthorization(platform: AdPlatform, organizationId: string): Promise<OAuthAuthorization> {
    const client = this.clients.get(platform);
    if (!client) throw new Error(`Platform client is not configured: ${platform}`);
    const authorization = await client.getAuthorization();
    if (authorization.organizationId !== organizationId) throw new Error("Platform authorization organization mismatch");
    if (!authorization.accountId) throw new Error("Platform advertising account is missing");
    return authorization;
  }
}
