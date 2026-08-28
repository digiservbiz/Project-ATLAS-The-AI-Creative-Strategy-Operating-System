import type { BusinessIntelligenceModel } from "./business-intelligence-model";

export type StrategicEvidenceType = "observed_evidence" | "user_fact" | "hypothesis" | "assumption" | "recommendation";
export interface StrategicEvidence { id: string; type: StrategicEvidenceType; statement: string; sourceIds?: string[]; confidence: number; createdAt: string; }
export interface StrategicHypothesis { id: string; statement: string; evidenceIds: string[]; confidence: number; status: "proposed" | "testing" | "supported" | "rejected" | "inconclusive"; }
export interface StrategicDecision { id: string; statement: string; evidenceIds: string[]; hypothesisIds?: string[]; confidence: number; approved: boolean; createdAt: string; }
export interface StrategicState {
  businessId: string;
  objective?: string;
  businessModel: BusinessIntelligenceModel["business"]["model"];
  targetMarkets: string[];
  audienceIds: string[];
  positioning?: string;
  messaging: string[];
  offerIds: string[];
  competitorIds: string[];
  activeHypotheses: StrategicHypothesis[];
  currentExperiments: string[];
  knownLearnings: string[];
  assumptions: StrategicEvidence[];
  evidence: StrategicEvidence[];
  decisions: StrategicDecision[];
  confidence: number;
  recommendedNextActions: string[];
  updatedAt: string;
}

export function createStrategicState(model: BusinessIntelligenceModel, objective?: string): StrategicState {
  const business = model.business;
  return {
    businessId: business.id,
    objective,
    businessModel: business.model,
    targetMarkets: [...business.markets],
    audienceIds: model.audiences.filter(a => a.businessId === business.id).map(a => a.id),
    positioning: model.brands.find(b => b.businessId === business.id)?.positioning,
    messaging: [],
    offerIds: model.offers.filter(o => o.businessId === business.id).map(o => o.id),
    competitorIds: model.competitors.filter(c => c.businessId === business.id).map(c => c.id),
    activeHypotheses: [],
    currentExperiments: [],
    knownLearnings: [],
    assumptions: [],
    evidence: [],
    decisions: [],
    confidence: 0.1,
    recommendedNextActions: [],
    updatedAt: new Date().toISOString(),
  };
}
