import type { AudienceIntelligence } from "./audience-intelligence";
import type { BusinessIntelligenceModel } from "./business-intelligence-model";
import type { CreativeExperiment } from "./creative-experimentation";
import type { CreativeHypothesis } from "./creative-hypothesis-engine";
import type { DecisionRecord } from "./decision-record";
import type { IntelligenceSnapshot } from "./intelligence-hub";
import type { LearningRecord } from "./learning-loop";
import { processPerformanceOutcome, type PlatformPerformanceInput, type PerformanceLearningThresholds, type CanonicalPerformanceMetrics } from "./performance-learning-engine";
import { applyLearning, refreshNextActions } from "./strategic-learning-integration";
import { buildIntelligenceSnapshot } from "./intelligence-hub";
import type { IntelligenceRepository, PersistenceEnvelope } from "./persistence-contract";
import { createStrategicState, type StrategicState } from "./strategic-state";
import type { SemanticIntelligenceService } from "@atlas/semantic-intelligence";
import { projectIntelligenceToSemantic } from "./semantic-intelligence-projector";
import type { CreativeDNA } from "./creative-dna";

export interface PersistentIntelligenceServiceOptions {
  repository: IntelligenceRepository;
  semanticService?: SemanticIntelligenceService;
  semanticScope?: { organizationId: string; projectId: string };
}

const stateId = (businessId: string) => `strategic-state:${businessId}`;
const learningId = (learning: LearningRecord) => learning.id;
const creativeDnaId = (dna: CreativeDNA) => dna.id;
const decisionId = (decision: DecisionRecord) => decision.id;
const hypothesisId = (hypothesis: CreativeHypothesis) => hypothesis.id;
const audienceId = (audience: AudienceIntelligence) => audience.id;
const experimentId = (experiment: CreativeExperiment) => experiment.id;

export class PersistentIntelligenceService {
  constructor(private readonly options: PersistentIntelligenceServiceOptions) {}

  async loadStrategicState(model: BusinessIntelligenceModel, objective?: string): Promise<StrategicState> {
    const businessId = model.business.id;
    const existing = await this.options.repository.get<StrategicState>(businessId, "strategic_state", stateId(businessId));
    if (existing) return structuredClone(existing.data);

    const state = createStrategicState(model, objective);
    await this.saveStrategicState(state);
    return state;
  }

  async saveStrategicState(state: StrategicState): Promise<PersistenceEnvelope<StrategicState>> {
    const existing = await this.options.repository.get<StrategicState>(state.businessId, "strategic_state", stateId(state.businessId));
    const now = new Date().toISOString();
    const record: PersistenceEnvelope<StrategicState> = {
      id: stateId(state.businessId),
      businessId: state.businessId,
      entityType: "strategic_state",
      version: existing ? existing.version + 1 : 1,
      data: structuredClone(state),
      evidenceIds: state.evidence.map(e => e.id),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await this.options.repository.put(record);
    await this.project(record);
    return record;
  }

  async recordLearning(learning: LearningRecord): Promise<PersistenceEnvelope<LearningRecord>> {
    const existing = await this.options.repository.get<LearningRecord>(learning.businessId, "learning", learningId(learning));
    const now = new Date().toISOString();
    const record: PersistenceEnvelope<LearningRecord> = {
      id: learningId(learning),
      businessId: learning.businessId,
      entityType: "learning",
      version: existing ? existing.version + 1 : 1,
      data: structuredClone(learning),
      evidenceIds: [...learning.evidenceIds],
      createdAt: existing?.createdAt ?? learning.createdAt ?? now,
      updatedAt: now,
    };
    await this.options.repository.put(record);
    await this.project(record);
    return record;
  }

  async recordCreativeDNA(dna: CreativeDNA): Promise<PersistenceEnvelope<CreativeDNA>> {
    if (!dna.id.trim()) throw new Error("Creative DNA ID is required");
    if (!dna.businessId.trim()) throw new Error("Creative DNA business ID is required");

    const existing = await this.options.repository.get<CreativeDNA>(dna.businessId, "creative_dna", creativeDnaId(dna));
    const now = new Date().toISOString();
    const record: PersistenceEnvelope<CreativeDNA> = {
      id: creativeDnaId(dna),
      businessId: dna.businessId,
      entityType: "creative_dna",
      version: existing ? existing.version + 1 : 1,
      data: structuredClone(dna),
      evidenceIds: [...dna.evidenceIds],
      createdAt: existing?.createdAt ?? dna.createdAt ?? now,
      updatedAt: now,
    };
    await this.options.repository.put(record);
    await this.project(record);
    return record;
  }

  async recordDecision(decision: DecisionRecord): Promise<PersistenceEnvelope<DecisionRecord>> {
    if (!decision.id.trim()) throw new Error("Decision ID is required");
    if (!decision.businessId.trim()) throw new Error("Decision business ID is required");

    const existing = await this.options.repository.get<DecisionRecord>(decision.businessId, "decision", decisionId(decision));
    const now = new Date().toISOString();
    const record: PersistenceEnvelope<DecisionRecord> = {
      id: decisionId(decision),
      businessId: decision.businessId,
      entityType: "decision",
      version: existing ? existing.version + 1 : 1,
      data: structuredClone(decision),
      evidenceIds: [...decision.evidenceIds],
      createdAt: existing?.createdAt ?? decision.createdAt ?? now,
      updatedAt: now,
    };
    await this.options.repository.put(record);
    await this.project(record);
    return record;
  }

  async recordHypothesis(hypothesis: CreativeHypothesis): Promise<PersistenceEnvelope<CreativeHypothesis>> {
    if (!hypothesis.id.trim()) throw new Error("Hypothesis ID is required");
    if (!hypothesis.businessId.trim()) throw new Error("Hypothesis business ID is required");

    const existing = await this.options.repository.get<CreativeHypothesis>(hypothesis.businessId, "hypothesis", hypothesisId(hypothesis));
    const now = new Date().toISOString();
    const record: PersistenceEnvelope<CreativeHypothesis> = {
      id: hypothesisId(hypothesis),
      businessId: hypothesis.businessId,
      entityType: "hypothesis",
      version: existing ? existing.version + 1 : 1,
      data: structuredClone(hypothesis),
      evidenceIds: [...hypothesis.evidenceIds],
      createdAt: existing?.createdAt ?? hypothesis.createdAt ?? now,
      updatedAt: now,
    };
    await this.options.repository.put(record);
    await this.project(record);
    return record;
  }

  async recordAudience(audience: AudienceIntelligence): Promise<PersistenceEnvelope<AudienceIntelligence>> {
    if (!audience.id.trim()) throw new Error("Audience ID is required");
    if (!audience.businessId.trim()) throw new Error("Audience business ID is required");

    const existing = await this.options.repository.get<AudienceIntelligence>(audience.businessId, "audience", audienceId(audience));
    const now = new Date().toISOString();
    const record: PersistenceEnvelope<AudienceIntelligence> = {
      id: audienceId(audience),
      businessId: audience.businessId,
      entityType: "audience",
      version: existing ? existing.version + 1 : 1,
      data: structuredClone(audience),
      evidenceIds: [...audience.evidenceIds],
      createdAt: existing?.createdAt ?? audience.updatedAt ?? now,
      updatedAt: now,
    };
    await this.options.repository.put(record);
    await this.project(record);
    return record;
  }

  async recordExperiment(experiment: CreativeExperiment, businessId: string, evidenceIds: string[] = []): Promise<PersistenceEnvelope<CreativeExperiment>> {
    if (!businessId.trim()) throw new Error("Experiment business ID is required");
    if (!experiment.id.trim()) throw new Error("Experiment ID is required");
    if (!experiment.hypothesisId.trim()) throw new Error("Experiment hypothesis ID is required");

    const existing = await this.options.repository.get<CreativeExperiment>(businessId, "experiment", experimentId(experiment));
    const now = new Date().toISOString();
    const record: PersistenceEnvelope<CreativeExperiment> = {
      id: experimentId(experiment),
      businessId,
      entityType: "experiment",
      version: existing ? existing.version + 1 : 1,
      data: structuredClone(experiment),
      evidenceIds: [...new Set(evidenceIds)],
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await this.options.repository.put(record);
    await this.project(record);
    return record;
  }

  async ingestPerformanceOutcome(
    state: StrategicState,
    dna: CreativeDNA,
    input: PlatformPerformanceInput,
    thresholds: Partial<PerformanceLearningThresholds> = {},
  ): Promise<{ state: StrategicState; creative: CreativeDNA; performance: CanonicalPerformanceMetrics; learning: LearningRecord | null }> {
    if (input.businessId !== state.businessId || dna.businessId !== state.businessId) {
      throw new Error("Performance outcome belongs to a different business");
    }

    const result = processPerformanceOutcome(dna, input, thresholds);
    await this.recordCreativeDNA(result.creative);
    if (!result.learning) {
      return { state: structuredClone(state), creative: result.creative, performance: result.performance, learning: null };
    }

    await this.recordLearning(result.learning);
    const nextState = refreshNextActions(applyLearning(state, result.learning));
    await this.saveStrategicState(nextState);
    return { state: nextState, creative: result.creative, performance: result.performance, learning: result.learning };
  }

  async ingestLearning(snapshot: IntelligenceSnapshot, learning: LearningRecord): Promise<IntelligenceSnapshot> {
    if (learning.businessId !== snapshot.state.businessId) throw new Error("Learning belongs to a different business");
    await this.recordLearning(learning);
    const state = refreshNextActions(applyLearning(snapshot.state, learning));
    await this.saveStrategicState(state);
    return buildIntelligenceSnapshot(snapshot.business, state);
  }

  async loadSnapshot(model: BusinessIntelligenceModel, objective?: string): Promise<IntelligenceSnapshot> {
    const state = await this.loadStrategicState(model, objective);
    return buildIntelligenceSnapshot(model, state);
  }

  private async project(record: PersistenceEnvelope): Promise<void> {
    const { semanticService, semanticScope } = this.options;
    if (!semanticService || !semanticScope) return;
    await projectIntelligenceToSemantic(semanticService, record, {
      ...semanticScope,
      sourceId: record.id,
      businessId: record.businessId,
    });
  }
}
