import type { AdPlatform, CampaignActionRequest, CampaignPlatformClient, CampaignRef } from "./contracts";

export * from "./contracts";

export class CampaignExecutionGateway {
  private readonly clients = new Map<AdPlatform, CampaignPlatformClient>();
  private readonly idempotency = new Set<string>();

  constructor(clients: CampaignPlatformClient[] = []) {
    for (const client of clients) this.clients.set(client.platform, client);
  }

  register(client: CampaignPlatformClient): void {
    this.clients.set(client.platform, client);
  }

  async execute(request: CampaignActionRequest): Promise<CampaignRef> {
    if (!request.idempotencyKey.trim()) throw new Error("idempotencyKey is required");
    if (request.requiresApproval) throw new Error("Campaign action requires human approval");
    if (this.idempotency.has(request.idempotencyKey)) {
      throw new Error(`Duplicate campaign action: ${request.idempotencyKey}`);
    }

    const client = this.clients.get(request.platform);
    if (!client) throw new Error(`Campaign platform is not configured: ${request.platform}`);

    const result = await client.execute(request);
    this.idempotency.add(request.idempotencyKey);
    return result;
  }
}
