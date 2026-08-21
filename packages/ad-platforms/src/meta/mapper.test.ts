import { describe, expect, it } from "vitest";
import { mapMetaAd, mapMetaAdSet, mapMetaCampaign, mapMetaCreative } from "./mapper";

describe("Meta normalization", () => {
  it("maps campaign budgets from minor units", () => {
    const result = mapMetaCampaign({ id: "c1", name: "Sales", status: "ACTIVE", daily_budget: "2500", objective: "OUTCOME_SALES" }, "org-1", "act-1");
    expect(result.platform).toBe("meta");
    expect(result.dailyBudget).toBe(25);
  });

  it("maps ad-set targeting and ad creative references", () => {
    const adSet = mapMetaAdSet({ id: "as1", campaign_id: "c1", targeting: { age_min: 25 } }, "org-1", "act-1");
    const ad = mapMetaAd({ id: "a1", campaign_id: "c1", adset_id: "as1", creative: { id: "cr1" } }, "org-1", "act-1");
    expect(adSet.targeting?.age_min).toBe(25);
    expect(ad.creativeId).toBe("cr1");
  });

  it("maps copy and media into one creative model", () => {
    const creative = mapMetaCreative({ id: "cr1", body: "Primary", title: "Headline", image_url: "https://example.com/a.jpg", link_url: "https://example.com" }, "org-1", "act-1");
    expect(creative.primaryText).toBe("Primary");
    expect(creative.mediaUrls).toEqual(["https://example.com/a.jpg"]);
  });
});
