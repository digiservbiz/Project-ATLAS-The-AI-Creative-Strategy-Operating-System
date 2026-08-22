import { describe, expect, it } from "vitest";
import { MetaGraphWriteTransport } from "./write-transport";

describe("MetaGraphWriteTransport", () => {
  it("adds the access token to authenticated POST requests", async () => {
    let path = "";
    let body: Record<string, string> | undefined;
    const transport = new MetaGraphWriteTransport({
      async post(requestPath, requestBody) { path = requestPath; body = requestBody; return { id: "123" }; },
    }, "secret-token");
    const response = await transport.post("act_1/campaigns", { name: "ATLAS", status: "PAUSED" });
    expect(path).toBe("act_1/campaigns");
    expect(body).toEqual({ name: "ATLAS", status: "PAUSED", access_token: "secret-token" });
    expect(response.id).toBe("123");
  });

  it("rejects an empty token", () => {
    expect(() => new MetaGraphWriteTransport({ post: async () => ({}) }, "")).toThrow("access token");
  });
});
