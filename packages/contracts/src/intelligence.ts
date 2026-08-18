import { z } from "zod";

export const semanticObjectTypeSchema = z.enum([
  "creative", "hook", "angle", "script", "offer", "landing_page",
  "product", "customer_problem", "research_finding", "memory", "campaign",
]);

export const semanticObjectSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  projectId: z.string().min(1),
  objectType: semanticObjectTypeSchema,
  sourceId: z.string().min(1),
  content: z.string().min(1),
  language: z.string().min(1).optional(),
  market: z.string().min(1).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string().datetime().optional(),
});

export const embeddingRecordSchema = z.object({
  objectId: z.string().min(1),
  provider: z.string().min(1),
  model: z.string().min(1),
  version: z.string().min(1),
  dimensions: z.number().int().positive(),
  vector: z.array(z.number()),
});

export const semanticSearchRequestSchema = z.object({
  organizationId: z.string().min(1),
  projectId: z.string().min(1),
  query: z.string().min(1),
  topK: z.number().int().positive().max(100).default(10),
  objectTypes: z.array(semanticObjectTypeSchema).default([]),
  filters: z.record(z.string(), z.unknown()).default({}),
});

export const semanticSearchResultSchema = z.object({
  object: semanticObjectSchema,
  similarity: z.number().min(-1).max(1),
  rank: z.number().int().positive(),
  provenance: z.record(z.string(), z.unknown()).default({}),
});

export const semanticSearchResponseSchema = z.object({
  results: z.array(semanticSearchResultSchema),
  embeddingModel: z.string().min(1),
});

export type SemanticObjectType = z.infer<typeof semanticObjectTypeSchema>;
export type SemanticObject = z.infer<typeof semanticObjectSchema>;
export type EmbeddingRecord = z.infer<typeof embeddingRecordSchema>;
export type SemanticSearchRequest = z.infer<typeof semanticSearchRequestSchema>;
export type SemanticSearchResult = z.infer<typeof semanticSearchResultSchema>;
export type SemanticSearchResponse = z.infer<typeof semanticSearchResponseSchema>;

export interface EmbeddingProvider {
  readonly providerId: string;
  readonly modelId: string;
  readonly modelVersion: string;
  readonly dimensions: number;
  embed(input: string): Promise<number[]>;
  embedBatch(inputs: string[]): Promise<number[][]>;
}

export interface SemanticRepository {
  upsertObject(object: SemanticObject): Promise<void>;
  saveEmbedding(record: EmbeddingRecord): Promise<void>;
  search(
    request: SemanticSearchRequest,
    queryVector: number[],
    embeddingModel: string,
  ): Promise<SemanticSearchResponse>;
}
