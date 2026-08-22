import { describe, expect, it } from "vitest";
import { AdDataSyncService } from "./sync-service";
import { InMemoryAdPlatformRepository } from "./repository";

describe("AdDataSyncService", () => {
  it("persists normalized account data and Meta performance", async () => {
    const repository = new InMemoryAdPlatformRepository();
    const service = new AdDataSyncService(repository);
    await service.persistAccount({
      campaigns: [{ platform: "meta", organizationId: "org-1", accountId: "act-1", campaignId: "c1", name: "Sales", status: "active" }],
      adSets: [], ads: [], creatives: [],
    });
    await service.persistMetaInsights("org-1", [{ campaign_id: "c1", impressions: "100", clicks: "10", spend: "20", conversions: "2", action_values: [{ action_type: "purchase", value: "80" }] }]);
    expect(repository.campaigns.size).toBe(1);
    expect(repository.performance).toHaveLength(1);
    expect(repository.performance[0].revenue).toBe(80);
  });
});
