import { describe, expect, it, vi } from "vitest";
import { ModelGateway, type ModelProvider } from "./index.js";

describe("ModelGateway", () => {
  it("routes generation to the explicitly selected provider", async () => {
    const provider: ModelProvider = {
      providerId: "mock",
      generate: vi.fn().mockResolvedValue({
        text: "Strategy output",
        provider: "mock",
        model: "mock-model",
      }),
    };
    const gateway = new ModelGateway();
    gateway.register(provider);

    const result = await gateway.generate("mock", {
      model: "mock-model",
      input: "Build a strategy",
    });

    expect(result.text).toBe("Strategy output");
    expect(provider.generate).toHaveBeenCalledOnce();
  });

  it("rejects duplicate provider registrations", () => {
    const provider: ModelProvider = {
      providerId: "mock",
      generate: vi.fn(),
    };
    const gateway = new ModelGateway();
    gateway.register(provider);

    expect(() => gateway.register(provider)).toThrow("Model provider already registered");
  });

  it("does not silently select a provider when the requested provider is missing", async () => {
    const gateway = new ModelGateway();
    await expect(gateway.generate("missing", {
      model: "model",
      input: "hello",
    })).rejects.toThrow("Model provider not registered: missing");
  });
});
