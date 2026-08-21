import { describe, expect, it } from "vitest";
import { MetaAccountSync } from "./sync";

class FakeTransport {
  async get(path: string): Promise<Record<string, unknown>> {
    if (path === "act-1/campaigns") return { data: [{ id: "c1", name: "Sales", status: "ACTIVE", daily_budget: "5000" }] };
    if (path === "c1/adsets") return { data: [{ id: "as1", campaign_id: "c1", name: "Broad", status: "ACTIVE", targeting: { age_min: 25 } }] };
    if (path === "as1/ads") return { data: [{ id: "a1", campaign_id: "c1", adset_id: "as1", name: "Creative A", status: "ACTIVE", creative: { id: "cr1" } }] };
    if (path === "cr1") return { id: "cr1", name: "Creative A", body: "Buy now", title: "Sale", image_url: "https://example.com/a.jpg" };
    throw new Error(`Unexpected path: ${path}`);
  }
}

describe("MetaAccountSync", () => {
  it("synchronizes and normalizes the account hierarchy", async () => {
    const sync = new MetaAccountSync(new FakeTransport(), "org-1", "act-1");
    const result = await sync.sync();
    expect(result.campaigns).toHaveLength(1);
    expect(result.adSets).toHaveLength(1);
    expect(result.ads).toHaveLength(1);
    expect(result.creatives).toHaveLength(1);
    expect(result.creatives[0].primaryText).toBe("Buy now");
  });
});
