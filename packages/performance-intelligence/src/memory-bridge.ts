import type { AgentContext } from "@atlas/orchestrator";
import type { AgentMemoryStore } from "@atlas/orchestrator";
import type { CampaignPerformanceRecord, PerformanceInsight } from "./contracts";

export class PerformanceMemoryBridge {
  constructor(private readonly memory: AgentMemoryStore) {}

  async capture(context: AgentContext, record: CampaignPerformanceRecord, insight: PerformanceInsight): Promise<void> {
    const now = new Date().toISOString();
    await this.memory.put({
      id: `performance:${record.platform}:${record.campaignId}:${record.timestamp}`,
      organizationId: context.organizationId,
      projectId: context.projectId,
      namespace: "campaign-performance",
      key: `${record.platform}:${record.campaignId}:${record.timestamp}`,
      value: { record, insight },
      importance: insight.score,
      createdAt: now,
      updatedAt: now,
    });
  }
}
