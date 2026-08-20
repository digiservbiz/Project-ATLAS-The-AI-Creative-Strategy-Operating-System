import { describe, expect, it } from "vitest";
import { CreativeProductionGateway } from "./index";
import type { CreativeGenerationProvider } from "./contracts";

const provider: CreativeGenerationProvider = {
  providerId: "test-image",
  capabilities: ["generate"],
  async generate(request) {
    return {
      id: "asset-1",
      organizationId: request.organizationId,
      type: request.type,
      provider: "test-image",
      status: "completed",
      url: "https://example.com/asset.png",
    };
  },
};

describe("CreativeProductionGateway", () => {
  it("routes generation to a capable provider", async () => {
    const gateway = new CreativeProductionGateway([provider]);
    const asset = await gateway.generate({
      organizationId: "org-1",
      type: "image",
      prompt: "premium product ad",
    });
    expect(asset.provider).toBe("test-image");
    expect(asset.status).toBe("completed");
  });

  it("fails clearly when no provider exists", async () => {
    const gateway = new CreativeProductionGateway([]);
    await expect(gateway.generate({
      organizationId: "org-1",
      type: "video",
      prompt: "product demonstration",
    })).rejects.toThrow("No creative provider supports video");
  });
});
