import type { NormalizedCampaign } from "../normalized-model";
import { fetchAllPages, type PaginatedTransport } from "./pagination";
import { mapMetaCampaign } from "./mapper";

export interface MetaSyncResult { campaigns: NormalizedCampaign[]; syncedAt: string; }

export class MetaSyncOrchestrator {
  constructor(private readonly transport: PaginatedTransport, private readonly organizationId: string, private readonly accountId: string) {}

  async syncCampaigns(): Promise<MetaSyncResult> {
    const payloads = await fetchAllPages<Record<string, unknown>>(this.transport, `${this.accountId}/campaigns`, {
      fields: "id,name,status,objective,daily_budget,currency",
      limit: "100",
    });
    return {
      campaigns: payloads.map((payload) => mapMetaCampaign(payload as never, this.organizationId, this.accountId)),
      syncedAt: new Date().toISOString(),
    };
  }
}
