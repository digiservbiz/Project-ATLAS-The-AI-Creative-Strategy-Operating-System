import { describe, expect, it } from "vitest";
import { mapMetaInsight } from "./insights";

describe("Meta Insights normalization", () => {
  it("maps string metrics and purchase value", () => {
    const snapshot = mapMetaInsight({
      campaign_id: "c1",
      ad_id: "a1",
      date_stop: "2026-08-20",
      impressions: "10000",
      clicks: "250",
      spend: "125.50",
      conversions: "5",
      action_values: [{ action_type: "purchase", value: "400" }],
    }, "org-1");

    expect(snapshot.impressions).toBe(10000);
    expect(snapshot.clicks).toBe(250);
    expect(snapshot.spend).toBe(125.5);
    expect(snapshot.conversions).toBe(5);
    expect(snapshot.revenue).toBe(400);
    expect(snapshot.platform).toBe("meta");
  });
});
