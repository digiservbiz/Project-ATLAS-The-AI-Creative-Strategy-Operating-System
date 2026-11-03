import type {
  CanonicalPerformanceMetrics,
  CreativeDNA,
  IntelligenceSnapshot,
  LearningRecord,
  PersistentIntelligenceService,
  PlatformPerformanceInput,
  PerformanceLearningThresholds,
} from "@atlas/intelligence";

export interface CreativeDNARepository {
  get(businessId: string, creativeId: string): Promise<CreativeDNA | null>;
}

export interface PerformanceIntelligenceIngestionResult {
  performance: CanonicalPerformanceMetrics;
  creative: CreativeDNA;
  learning: LearningRecord | null;
  snapshot: IntelligenceSnapshot;
}

/**
 * Provider boundary for turning platform performance into durable ATLAS intelligence.
 * Platform adapters normalize provider payloads; the persistence service owns attribution,
 * evidence retention, threshold-gated learning, Strategic State updates and SIEL projection.
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
    if (snapshot.state.businessId !== input.businessId) {
      throw new Error("Performance belongs to a different business");
    }

    const dna = await this.creatives.get(input.businessId, input.creativeId);
    if (!dna) throw new Error(`Creative DNA not found: ${input.creativeId}`);
    if (dna.businessId !== input.businessId) {
      throw new Error("Creative performance business scope mismatch");
    }

    const result = await this.intelligence.ingestPerformanceSnapshot(
      snapshot,
      dna,
      input,
      this.thresholds,
    );
    return {
      performance: result.performance,
      creative: result.creative,
      learning: result.learning,
      snapshot: result.snapshot,
    };
  }
}
