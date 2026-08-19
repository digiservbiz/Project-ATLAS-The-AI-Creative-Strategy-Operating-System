import type { SemanticIntelligenceService } from "@atlas/semantic-intelligence";
import type { CreativeArtifact } from "@atlas/contracts";

export class CreativeSemanticIndexer {
  constructor(private readonly semantic: SemanticIntelligenceService) {}

  async index(artifact: CreativeArtifact): Promise<void> {
    const content = [
      artifact.title,
      artifact.primaryText,
      artifact.headline,
      artifact.description,
      artifact.callToAction,
    ].filter(Boolean).join("\n");

    if (!content.trim()) return;

    await this.semantic.index({
      id: `creative:${artifact.id}`,
      organizationId: artifact.organizationId,
      projectId: undefined,
      objectType: "creative_artifact",
      sourceId: artifact.source.sourceId,
      content,
      metadata: {
        source: artifact.source.source,
        platform: artifact.source.platform,
        advertiserName: artifact.source.advertiserName,
        market: artifact.source.market,
        language: artifact.language,
        firstSeenAt: artifact.firstSeenAt,
        lastSeenAt: artifact.lastSeenAt,
      },
      createdAt: artifact.source.capturedAt,
    });
  }

  async indexBatch(artifacts: CreativeArtifact[]): Promise<void> {
    for (const artifact of artifacts) await this.index(artifact);
  }
}
