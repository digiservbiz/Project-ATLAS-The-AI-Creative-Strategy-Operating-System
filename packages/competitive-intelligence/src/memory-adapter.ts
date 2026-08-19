import type { CreativeArtifact } from "@atlas/contracts";

export interface CreativeArtifactStore {
  upsert(artifact: CreativeArtifact): Promise<void>;
  findBySource(source: string, sourceId: string): Promise<CreativeArtifact | null>;
}

export class InMemoryCreativeArtifactStore implements CreativeArtifactStore {
  private readonly items = new Map<string, CreativeArtifact>();

  async upsert(artifact: CreativeArtifact): Promise<void> {
    this.items.set(`${artifact.source.source}:${artifact.source.sourceId}`, artifact);
  }

  async findBySource(source: string, sourceId: string): Promise<CreativeArtifact | null> {
    return this.items.get(`${source}:${sourceId}`) ?? null;
  }
}
