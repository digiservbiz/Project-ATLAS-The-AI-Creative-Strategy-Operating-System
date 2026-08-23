export interface KnowledgeRecord { id: string; topic: string; principles: string[]; decisionRules: string[]; applicableAgents: string[]; sourcePolicy: "internal_summary" | "public_reference"; }
export interface KnowledgeStore { search(query: string, limit?: number): Promise<KnowledgeRecord[]>; }

export interface KnowledgeContext { query: string; records: KnowledgeRecord[]; rules: string[]; }

export class KnowledgeRuntime {
  constructor(private readonly store: KnowledgeStore) {}

  async retrieve(query: string, agentId?: string, limit = 8): Promise<KnowledgeContext> {
    const records = await this.store.search(query, limit);
    const filtered = agentId
      ? records.filter((record) => record.applicableAgents.length === 0 || record.applicableAgents.includes(agentId))
      : records;
    return {
      query,
      records: filtered,
      rules: filtered.flatMap((record) => record.decisionRules),
    };
  }
}

export function buildKnowledgePrompt(context: KnowledgeContext): string {
  if (!context.records.length) return "No specialized knowledge was retrieved. Do not invent source-backed claims.";
  return context.records.map((record) => `## ${record.topic}\nPrinciples:\n${record.principles.map((p) => `- ${p}`).join("\n")}\nDecision rules:\n${record.decisionRules.map((r) => `- ${r}`).join("\n")}`).join("\n\n");
}
