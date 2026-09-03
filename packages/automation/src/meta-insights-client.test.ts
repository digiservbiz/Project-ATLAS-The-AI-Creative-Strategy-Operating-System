import { describe, expect, it, vi } from "vitest";
import { MetaInsightsClient } from "./meta-insights-client";

describe("MetaInsightsClient", () => {
  it("requests ad-level insights with the canonical fields", async () => {
    const get = vi.fn(async () => ({ data: [{ ad_id: "ad-1" }] }));
    const client = new MetaInsightsClient({ http: { get } });

    const result = await client.fetch({
      accessToken: "secret",
      adAccountId: "123456",
      dateStart: "2026-09-01",
      dateStop: "2026-09-02",
    });

    expect(result.data).toHaveLength(1);
    expect(get).toHaveBeenCalledWith(
      "https://graph.facebook.com/v23.0/act_123456/insights",
      expect.objectContaining({
        access_token: "secret",
        level: "ad",
        fields: expect.stringContaining("creative_id"),
        time_range: JSON.stringify({ since: "2026-09-01", until: "2026-09-02" }),
      }),
    );
  });

  it("does not duplicate act_ in account IDs", async () => {
    const get = vi.fn(async () => ({ data: [] }));
    const client = new MetaInsightsClient({ http: { get } });
    await client.fetch({ accessToken: "secret", adAccountId: "act_123", dateStart: "2026-09-01", dateStop: "2026-09-01" });
    expect(get.mock.calls[0]?.[0]).toBe("https://graph.facebook.com/v23.0/act_123/insights");
  });

  it("rejects invalid requests before making a network call", async () => {
    const get = vi.fn(async () => ({ data: [] }));
    const client = new MetaInsightsClient({ http: { get } });
    await expect(client.fetch({ accessToken: "", adAccountId: "123", dateStart: "2026-09-02", dateStop: "2026-09-01" })).rejects.toThrow("Meta access token is required");
    expect(get).not.toHaveBeenCalled();
  });

  it("rejects an inverted date range", async () => {
    const client = new MetaInsightsClient({ http: { get: async () => ({ data: [] }) } });
    await expect(client.fetch({ accessToken: "secret", adAccountId: "123", dateStart: "2026-09-03", dateStop: "2026-09-01" })).rejects.toThrow("dateStart cannot be after dateStop");
  });
});
