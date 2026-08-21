import { describe, expect, it } from "vitest";
import { fetchAllPages } from "./pagination";

describe("Meta pagination", () => {
  it("follows next-page URLs", async () => {
    const calls: string[] = [];
    const transport = {
      async get(path: string) {
        calls.push(path);
        if (path === "account/campaigns") return { data: [{ id: "1" }], paging: { next: "account/campaigns?page=2" } };
        return { data: [{ id: "2" }] };
      },
    };
    const result = await fetchAllPages<{ id: string }>(transport, "account/campaigns", { limit: "100" });
    expect(result.map((x) => x.id)).toEqual(["1", "2"]);
    expect(calls).toEqual(["account/campaigns", "account/campaigns?page=2"]);
  });

  it("stops at maxPages instead of looping forever", async () => {
    const transport = { async get(path: string) { return { data: [{ path }], paging: { next: "next" } }; } };
    await expect(fetchAllPages(transport, "start", {}, 2)).rejects.toThrow("maxPages=2");
  });
});
