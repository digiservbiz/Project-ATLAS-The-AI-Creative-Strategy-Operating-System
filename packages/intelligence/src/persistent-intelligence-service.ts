import type { BusinessIntelligenceModel } from "./business-intelligence-model";
import type { IntelligenceSnapshot } from "./intelligence-hub";
import type { LearningRecord } from "./learning-loop";
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
