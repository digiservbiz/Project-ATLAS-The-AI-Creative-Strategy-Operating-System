import { describe, expect, it } from "vitest";
import { PlatformAuthorizationRegistry } from "./authorization";
import type { PlatformApiClient } from "./contracts";

const meta: PlatformApiClient = {
  platform: "meta",
  async getAuthorization() {
    return { platform: "meta", organizationId: "org-1", accountId: "act-1", scopes: ["ads_read"] };
  },
  async fetchCampaignMetrics() { return []; },
  async executeCampaignAction() { return {}; },
};

describe("PlatformAuthorizationRegistry", () => {
  it("accepts authorization for the correct organization", async () => {
    const registry = new PlatformAuthorizationRegistry();
    registry.register(meta);
    const auth = await registry.requireAuthorization("meta", "org-1");
    expect(auth.accountId).toBe("act-1");
  });

  it("rejects cross-organization authorization", async () => {
    const registry = new PlatformAuthorizationRegistry();
    registry.register(meta);
    await expect(registry.requireAuthorization("meta", "org-2")).rejects.toThrow("organization mismatch");
  });
});
