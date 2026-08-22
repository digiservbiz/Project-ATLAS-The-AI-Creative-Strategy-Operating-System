export type CreativeKind = "image" | "video";
export type CreativeStatus = "queued" | "processing" | "completed" | "failed";

export interface CreativeGenerationRequest {
  jobId: string;
  kind: CreativeKind;
  prompt: string;
  aspectRatio: "1:1" | "4:5" | "9:16" | "16:9";
  sourceAssetUrls?: string[];
  metadata?: Record<string, unknown>;
}

export interface CreativeGenerationResult {
  jobId: string;
  status: CreativeStatus;
  assetUrl?: string;
  providerJobId?: string;
  error?: string;
}

export interface CreativeProvider {
  readonly name: string;
  supports(kind: CreativeKind): boolean;
  generate(request: CreativeGenerationRequest): Promise<CreativeGenerationResult>;
}

export class CreativeProviderRouter {
  constructor(private readonly providers: CreativeProvider[]) {}

  async generate(request: CreativeGenerationRequest): Promise<CreativeGenerationResult> {
    const provider = this.providers.find((candidate) => candidate.supports(request.kind));
    if (!provider) throw new Error(`No creative provider supports ${request.kind}`);
    return provider.generate(request);
  }
}
