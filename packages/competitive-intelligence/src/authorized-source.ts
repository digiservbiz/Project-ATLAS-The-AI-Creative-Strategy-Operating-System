import type { CreativeArtifact, CreativeIngestionQuery, CreativeSource, CreativeSourceAdapter } from "@atlas/contracts";

export interface AuthorizedCreativeClient {
  search(query: CreativeIngestionQuery): Promise<CreativeArtifact[]>;
}

/**
 * Adapter boundary for an official/authorized platform integration.
 * The platform-specific SDK/API implementation is injected at runtime.
 */
export class AuthorizedPlatformSourceAdapter implements CreativeSourceAdapter {
  constructor(
    public readonly source: CreativeSource,
    private readonly client: AuthorizedCreativeClient,
  ) {}

  search(query: CreativeIngestionQuery): Promise<CreativeArtifact[]> {
    return this.client.search(query);
  }
}
