import type { CreativeGenerationProvider, CreativeGenerationRequest, CreativeAsset } from "./contracts";

export class MockCreativeProvider implements CreativeGenerationProvider {
  readonly providerId = "mock";
  readonly capabilities = ["generate"] as const;

  async generate(request: CreativeGenerationRequest): Promise<CreativeAsset> {
    return {
      id: `mock-${crypto.randomUUID()}`,
      organizationId: request.organizationId,
      type: request.type,
      provider: this.providerId,
      status: "completed",
      metadata: { prompt: request.prompt, ...request.metadata },
    };
  }
}
