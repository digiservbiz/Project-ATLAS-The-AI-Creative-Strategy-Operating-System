export type CreativeAssetType = "image" | "video" | "audio" | "avatar_video";
export type CreativeProviderCapability = "generate" | "edit" | "upscale" | "transcribe" | "voice";

export interface CreativeGenerationRequest {
  organizationId: string;
  projectId?: string;
  type: CreativeAssetType;
  prompt: string;
  negativePrompt?: string;
  referenceAssetIds?: string[];
  aspectRatio?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
}

export interface CreativeAsset {
  id: string;
  organizationId: string;
  type: CreativeAssetType;
  provider: string;
  providerJobId?: string;
  status: "queued" | "processing" | "completed" | "failed";
  url?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface CreativeGenerationProvider {
  readonly providerId: string;
  readonly capabilities: CreativeProviderCapability[];
  generate(request: CreativeGenerationRequest): Promise<CreativeAsset>;
}
