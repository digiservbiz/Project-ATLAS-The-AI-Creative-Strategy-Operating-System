import type {
  CreativeAsset,
  CreativeAssetType,
  CreativeGenerationProvider,
  CreativeGenerationRequest,
} from "./contracts";

export * from "./contracts";

export class CreativeProductionGateway {
  constructor(private readonly providers: CreativeGenerationProvider[]) {}

  async generate(request: CreativeGenerationRequest): Promise<CreativeAsset> {
    const provider = this.selectProvider(request.type);
    return provider.generate(request);
  }

  private selectProvider(type: CreativeAssetType): CreativeGenerationProvider {
    const capability = type === "image" || type === "video" ? "generate" : type === "audio" ? "voice" : "generate";
    const provider = this.providers.find((candidate) => candidate.capabilities.includes(capability));
    if (!provider) throw new Error(`No creative provider supports ${type}`);
    return provider;
  }
}
