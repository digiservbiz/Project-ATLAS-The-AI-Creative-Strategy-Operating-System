import { describe, expect, it } from "vitest";
import { AdPlatformSyncWriter } from "./sync-writer";
import { InMemoryAdPlatformRepository } from "./repository";

describe("AdPlatformSyncWriter", () => {
  it("persists the complete normalized account snapshot", async () => {
    const repository = new InMemoryAdPlatformRepository();
    const writer = new AdPlatformSyncWriter(repository);
    await writer.write({
      campaigns: [{ platform: "meta", organizationId: "org-1", accountId: "act-1", campaignId: "c1", name: "Sales", status: "active" }],
      adSets: [{ platform: "meta", organizationId: "org-1", accountId: "act-1", campaignId: "c1", adSetId: "as1", name: "Broad", status: "active" }],
      ads: [{ platform: "meta", organizationId: "org-1", accountId: "act-1", campaignId: "c1", adSetId: "as1", adId: "a1", name: "Ad", status: "active" }],
      creatives: [{ platform: "meta", organizationId: "org-1", accountId: "act-1", creativeId: "cr1", name: "Creative" }],
    });
    expect(repository.campaigns.size).toBe(1);
    expect(repository.adSets.size).toBe(1);
    expect(repository.ads.size).toBe(1);
    expect(repository.creatives.size).toBe(1);
  });
});
