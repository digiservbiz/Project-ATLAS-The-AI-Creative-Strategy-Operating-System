import { describe, expect, it } from "vitest";
import { MetaAuthService, type TokenRecord, type TokenStore } from "./auth";

class MemoryTokenStore implements TokenStore {
  private value?: TokenRecord;
  async get() { return this.value; }
  async put(record: TokenRecord) { this.value = record; }
  async delete() { this.value = undefined; }
}

describe("MetaAuthService", () => {
  it("requires a valid token", async () => {
    const store = new MemoryTokenStore();
    await store.put({ platform: "meta", organizationId: "org-1", accountId: "act-1", accessToken: "secret", scopes: ["ads_read"] });
    const token = await new MetaAuthService(store).requireToken("org-1", "act-1");
    expect(token.accessToken).toBe("secret");
  });

  it("rejects expired tokens", async () => {
    const store = new MemoryTokenStore();
    await store.put({ platform: "meta", organizationId: "org-1", accountId: "act-1", accessToken: "secret", scopes: [], expiresAt: "2020-01-01T00:00:00Z" });
    await expect(new MetaAuthService(store).requireToken("org-1", "act-1")).rejects.toThrow("expired");
  });
});
