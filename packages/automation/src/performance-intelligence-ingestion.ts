import type {
  CreativeDNA,
  IntelligenceSnapshot,
  LearningRecord,
  PersistentIntelligenceService,
  PlatformPerformanceInput,
  PerformanceLearningThresholds,
} from "@atlas/intelligence";
import {
  normalizePerformance,
  applyPerformanceToCreativeDNA,
  createPerformanceLearning,
} from "@atlas/intelligence";

export interface CreativeDNARepository {
  get(businessId: string, creativeId: string): Promise<CreativeDNA | null>;
}

export interface PerformanceIntelligenceIngestionResult {
  performance: ReturnType<typeof normalizePerformance>;
  creative: CreativeDNA;
  learning: LearningRecord | null;
  snapshot: IntelligenceSnapshot;
}

/**
 * Production boundary for turning provider performance into durable ATLAS intelligence.
 * Platform adapters map provider responses into PlatformPerformanceInput; this service
 * owns Creative DNA persistence and feeds qualifying outcomes into the learning loop.
 */
export class PerformanceIntelligenceIngestion {
  constructor(
    private readonly creatives: CreativeDNARepository,
    private readonly intelligence: PersistentIntelligenceService,
    private readonly thresholds: Partial<PerformanceLearningThresholds> = {},
  ) {}

  async process(
    input: PlatformPerformanceInput,
    snapshot: IntelligenceSnapshot,
  ): Promise<PerformanceIntelligenceIngestionResult> {
    const performance = normalizePerformance(input);
    if (snapshot.state.businessId !== performance.businessId) {
      throw new Error("Performance belongs to a different business");
    }

    const dna = await this.creatives.get(performance.businessId, performance.creativeId);
    if (!dna) throw new Error(`Creative DNA not found: ${performance.creativeId}`);
    if (dna.businessId !== performance.businessId) throw new Error("Creative performance business scope mismatch");

    const creative = applyPerformanceToCreativeDNA(dna, performance);
    await this.intelligence.recordCreativeDNA(creative);

    const learning = createPerformanceLearning(creative, performance, this.thresholds);
    const updatedSnapshot = learning
      ? await this.intelligence.ingestLearning(snapshot, learning)
      : snapshot;

    return { performance, creative, learning, snapshot: updatedSnapshot };
  }
}
