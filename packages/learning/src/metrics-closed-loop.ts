import type { MetricsSnapshot } from "@atlas/analytics";
import type { LearningMemory, LearningMemoryPort, StrategyDecision, StrategyPort } from "./closed-loop-learning";
import { metricsToLearningSignals } from "./metrics-learning-bridge";

export interface ClosedLoopMetricsResult {
  signals: ReturnType<typeof metricsToLearningSignals>;
  memories: LearningMemory[];
  decisions: StrategyDecision[];
}

export class MetricsClosedLoop {
  constructor(private readonly memory: LearningMemoryPort, private readonly strategy: StrategyPort) {}

  async ingest(snapshot: MetricsSnapshot): Promise<ClosedLoopMetricsResult> {
    const signals = metricsToLearningSignals(snapshot);
    const memories = await this.memory.persist(signals.map((signal) => ({
      sourceId: signal.sourceMetricId,
      category: signal.category,
      statement: signal.signal,
      confidence: signal.confidence,
      tags: [snapshot.campaignId, snapshot.creativeId ?? "campaign", signal.category],
    })));

    const decisions: StrategyDecision[] = [];
    for (const signal of signals) {
      const related = memories.filter((memory) => memory.sourceId === signal.sourceMetricId);
      decisions.push(await this.strategy.createDecision({
        id: `decision:${snapshot.id}:${signal.id}`,
        objective: `Improve future performance for ${snapshot.campaignId}`,
        context: { metricSnapshotId: snapshot.id, source: snapshot.source, signal: signal.signal, value: signal.value },
        constraints: ["Use evidence-backed changes", "Preserve controlled experimentation", "Do not treat one snapshot as universal truth"],
        recommendations: signal.category === "winner"
          ? ["Preserve the winning mechanism", "Create controlled variations", "Test incremental scale"]
          : signal.category === "weakness"
            ? ["Avoid scaling the weak pattern", "Investigate message-audience fit", "Test a materially different creative hypothesis"]
            : ["Create targeted optimization variants", "Compare audience and placement segments", "Validate the change with another test"],
        evidenceMemoryIds: related.map((memory) => memory.id),
      }));
    }
    return { signals, memories, decisions };
  }
}
