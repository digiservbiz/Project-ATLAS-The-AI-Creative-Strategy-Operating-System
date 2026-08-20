import { describe, expect, it } from "vitest";
import { CampaignExecutionGateway } from "./index";
import type { CampaignPlatformClient } from "./contracts";

const meta: CampaignPlatformClient = {
  platform: "meta",
  async execute(request) {
    return { platform: "meta", campaignId: request.campaign?.name ?? "campaign-1", status: "created" };
  },
};

describe("CampaignExecutionGateway", () => {
  it("routes an authorized action to the configured platform", async () => {
    const gateway = new CampaignExecutionGateway([meta]);
    const result = await gateway.execute({
      organizationId: "org-1",
      platform: "meta",
      action: "create_campaign",
      campaign: { organizationId: "org-1", name: "Test Campaign", objective: "sales" },
      idempotencyKey: "run-1:create-campaign",
    });
    expect(result.status).toBe("created");
  });

  it("blocks duplicate actions", async () => {
    const gateway = new CampaignExecutionGateway([meta]);
    const request = {
      organizationId: "org-1",
      platform: "meta" as const,
      action: "pause_campaign" as const,
      campaignId: "c1",
      idempotencyKey: "run-1:pause-c1",
    };
    await gateway.execute(request);
    await expect(gateway.execute(request)).rejects.toThrow("Duplicate campaign action");
  });

  it("blocks actions requiring approval", async () => {
    const gateway = new CampaignExecutionGateway([meta]);
    await expect(gateway.execute({
      organizationId: "org-1",
      platform: "meta",
      action: "update_budget",
      campaignId: "c1",
      budget: 100,
      idempotencyKey: "run-1:budget-c1",
      requiresApproval: true,
    })).rejects.toThrow("requires human approval");
  });
});
