import type { AgentContext, AgentMemoryStore } from "@atlas/orchestrator";
import type { CampaignMetricSnapshot, PerformanceInsight } from "./contracts";

export interface PerformanceMemoryRecord {
  type: "performance_observation";
  organizationId: string;
  platform: CampaignMetricSnapshot["platform"];
  campaignId: string;
  timestamp: string;
  metrics: CampaignMetricSnapshot;
  insight: PerformanceInsight;
}

export class PerformanceLearningBridge {
  constructor(private readonly memory: AgentMemoryStore) {}

  async record(context: AgentContext, snapshot: CampaignMetricSnapshot, insight: PerformanceInsight): Promise<void> {
    const record: PerformanceMemoryRecord = {
      type: "performance_observation",
      organizationId: snapshot.organizationId,
      platform: snapshot.platform,
      campaignId: snapshot.campaignId,
      timestamp: snapshot.timestamp,
      metrics: snapshot,
      insight,
    };
    await this.memory.store(context, {
      key: `performance:${snapshot.platform}:${snapshot.campaignId}:${snapshot.timestamp}`,
      value: record,
      tags: ["performance", snapshot.platform, snapshot.campaignId, insight.severity],
    });
  }
}
