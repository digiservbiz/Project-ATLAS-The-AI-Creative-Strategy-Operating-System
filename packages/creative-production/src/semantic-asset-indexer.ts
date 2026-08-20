import type { SemanticIntelligenceService } from "@atlas/semantic-intelligence";
import type { CreativeAsset } from "./contracts";

export class CreativeAssetSemanticIndexer {
  constructor(private readonly semantic: SemanticIntelligenceService) {}

  async index(asset: CreativeAsset): Promise<void> {
    await this.semantic.index({
      id: `asset:${asset.id}`,
      organizationId: asset.organizationId,
      projectId: undefined,
      objectType: "creative_asset",
      sourceId: asset.providerJobId ?? asset.id,
      content: [asset.type, asset.provider, asset.status, asset.url].filter(Boolean).join(" "),
      metadata: {
        provider: asset.provider,
        providerJobId: asset.providerJobId,
        mimeType: asset.mimeType,
        thumbnailUrl: asset.thumbnailUrl,
        status: asset.status,
        ...(asset.metadata ?? {}),
      },
    });
  }
}
