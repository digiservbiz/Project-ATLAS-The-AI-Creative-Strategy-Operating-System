import type { CreativeAssetType, CreativeGenerationProvider } from "./contracts";

export class CreativeProviderRegistry {
  constructor(private readonly providers: CreativeGenerationProvider[]) {}

  resolve(type: CreativeAssetType): CreativeGenerationProvider {
    const capability = type === "audio" ? "voice" : "generate";
    const provider = this.providers.find((item) => item.capabilities.includes(capability));
    if (!provider) throw new Error(`No provider available for asset type: ${type}`);
    return provider;
  }

  list(): string[] {
    return this.providers.map((provider) => provider.providerId);
  }
}
