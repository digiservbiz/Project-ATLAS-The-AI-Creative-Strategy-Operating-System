export interface LearningMemory { id: string; sourceId: string; category: "winner" | "weakness" | "audience" | "optimization"; statement: string; confidence: number; createdAt: string; tags: string[]; }
export interface LearningMemoryStore { save(memory: LearningMemory): Promise<void>; search(query: string, limit?: number): Promise<LearningMemory[]>; }

export class LearningMemoryService {
  constructor(private readonly store: LearningMemoryStore) {}

  async persist(signals: Array<Omit<LearningMemory, "id" | "createdAt">>): Promise<LearningMemory[]> {
    const memories = signals.map((signal, index) => ({ ...signal, id: `learning:${Date.now()}:${index}`, createdAt: new Date().toISOString() }));
    await Promise.all(memories.map((memory) => this.store.save(memory)));
    return memories;
  }

  async retrieve(query: string, limit = 8): Promise<LearningMemory[]> {
    if (!query.trim()) return [];
    return this.store.search(query, limit);
  }
}
