import type { CreativeDNA, LearningRecord, PersistentIntelligenceService } from "@atlas/intelligence";
import {
  normalizePerformance,
  applyPerformanceToCreativeDNA,
  createPerformanceLearning,
  type PlatformPerformanceInput,
  type PerformanceLearningThresholds,
} from "@atlas/intelligence";

export interface CreativeDNARepository {
  get(businessId: string, creativeId: string): Promise<CreativeDNA | null>;
  put(dna: CreativeDNA): Promise<void>;
}

export interface PerformanceIntelligenceIngestionResult {
  performance: ReturnType<typeof normalizePerformance>;
  creative: CreativeDNA;
  learning: LearningRecord | null;
}

/**
 * Production boundary for turning platform performance into durable ATLAS intelligence.
 * The adapter deliberately knows nothing about Meta/TikTok APIs; platform adapters only
 * need to map their response into PlatformPerformanceInput.
 */
export class PerformanceIntelligenceIngestion {
  constructor(
    private readonly creatives: CreativeDNARepository,
    private readonly intelligence: PersistentIntelligenceService,
    private readonly thresholds: Partial<PerformanceLearningThresholds> = {},
  ) {}

  async process(input: PlatformPerformanceInput): Promise<PerformanceIntelligenceIngestionResult> {
    const performance = normalizePerformance(input);
    const dna = await this.creatives.get(performance.businessId, performance.creativeId);
    if (!dna) throw new Error(`Creative DNA not found: ${performance.creativeId}`);
    if (dna.businessId !== performance.businessId) throw new Error("Creative performance business scope mismatch");

    const creative = applyPerformanceToCreativeDNA(dna, performance);
    await this.creatives.put(creative);

    const learning = createPerformanceLearning(creative, performance, this.thresholds);
    if (learning) await this.intelligence.recordLearning(learning);

    return { performance, creative, learning };
  }
}
