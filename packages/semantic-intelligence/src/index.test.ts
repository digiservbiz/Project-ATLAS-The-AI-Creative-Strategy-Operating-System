import { describe, expect, it } from "vitest";
import type { EmbeddingProvider, SemanticObject } from "@atlas/contracts";
import { InMemorySemanticRepository } from "./in-memory-repository.js";
import { SemanticIntelligenceService } from "./index.js";

class FakeEmbeddingProvider implements EmbeddingProvider {
  readonly providerId = "test";
  readonly modelId = "test-embedding";
  readonly modelVersion = "1";
  readonly dimensions = 3;

  async embed(input: string): Promise<number[]> {
    if (input.includes("wall")) return [1, 0, 0];
    if (input.includes("coffee")) return [0, 1, 0];
    return [0, 0, 1];
  }

  async embedBatch(inputs: string[]): Promise<number[][]> {
    return Promise.all(inputs.map((input) => this.embed(input)));
  }
}

const object = (id: string, content: string): SemanticObject => ({
  id,
  organizationId: "org-1",
  projectId: "project-1",
  objectType: "creative",
  sourceId: `source-${id}`,
  content,
  metadata: {},
});

describe("SemanticIntelligenceService", () => {
  it("indexes and retrieves semantically similar objects", async () => {
    const service = new SemanticIntelligenceService(
      new FakeEmbeddingProvider(),
      new InMemorySemanticRepository(),
    );

    await service.index(object("wall-1", "Install this on your wall without drilling"));
    await service.index(object("coffee-1", "Make coffee anywhere"));

    const result = await service.search({
      organizationId: "org-1",
      projectId: "project-1",
      query: "wall installation without drilling",
      topK: 2,
      objectTypes: ["creative"],
      filters: {},
    });

    expect(result.results[0]?.object.id).toBe("wall-1");
    expect(result.results[0]?.rank).toBe(1);
    expect(result.embeddingModel).toBe("test-embedding");
  });

  it("enforces organization and project isolation", async () => {
    const repository = new InMemorySemanticRepository();
    const provider = new FakeEmbeddingProvider();
    const service = new SemanticIntelligenceService(provider, repository);

    await service.index(object("org-1", "wall product"));
    await repository.upsertObject({ ...object("org-2", "wall product"), organizationId: "org-2" });
    await repository.saveEmbedding({
      objectId: "org-2",
      provider: provider.providerId,
      model: provider.modelId,
      version: provider.modelVersion,
      dimensions: provider.dimensions,
      vector: [1, 0, 0],
    });

    const result = await service.search({
      organizationId: "org-1",
      projectId: "project-1",
      query: "wall",
      topK: 10,
      objectTypes: [],
      filters: {},
    });

    expect(result.results.map((item) => item.object.id)).toEqual(["org-1"]);
  });
});
