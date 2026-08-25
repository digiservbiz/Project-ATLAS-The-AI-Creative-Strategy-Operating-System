import type { LearningMemory, LearningMemoryPort } from "./closed-loop-learning";

export interface LearningMemoryQuery {
  text: string;
  categories?: Array<LearningMemory["category"]>;
  minConfidence?: number;
  limit?: number;
}

export class LearningMemoryRetriever {
  constructor(private readonly memory: LearningMemoryPort) {}

  async retrieve(query: LearningMemoryQuery): Promise<LearningMemory[]> {
    const items = await this.memory.retrieve(query.text, query.limit ?? 20);
    return items
      .filter((item) => !query.categories?.length || query.categories.includes(item.category))
      .filter((item) => item.confidence >= (query.minConfidence ?? 0))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, query.limit ?? 20);
  }
}
