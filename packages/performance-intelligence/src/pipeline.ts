import type { AgentContext } from "@atlas/orchestrator";
import type { AgentMemoryStore } from "@atlas/orchestrator";
import { analyzePerformance, normalizeSnapshot } from "./index";
import { PerformanceMemoryBridge } from "./memory-bridge";
import type { CampaignMetricSnapshot, PerformanceInsight } from "./contracts";

export class PerformancePipeline {
  private readonly memoryBridge: PerformanceMemoryBridge;

  constructor(private readonly memory: AgentMemoryStore) {
    this.memoryBridge = new PerformanceMemoryBridge(memory);
  }

  async process(context: AgentContext, snapshots: CampaignMetricSnapshot[]): Promise<PerformanceInsight[]> {
    const insights: PerformanceInsight[] = [];
    for (const snapshot of snapshots) {
      const record = normalizeSnapshot(snapshot);
      const insight = analyzePerformance(record);
      await this.memoryBridge.capture(context, record, insight);
      insights.push(insight);
    }
    return insights;
  }
}
