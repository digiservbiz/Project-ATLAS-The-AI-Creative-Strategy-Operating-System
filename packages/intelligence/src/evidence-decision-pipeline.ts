import type { StrategicDecision, StrategicEvidence, StrategicHypothesis, StrategicState } from "./strategic-state";

export function addEvidence(state: StrategicState, evidence: StrategicEvidence): StrategicState {
  if (evidence.confidence < 0 || evidence.confidence > 1) throw new Error("Evidence confidence must be between 0 and 1");
  if (state.evidence.some(e => e.id === evidence.id)) throw new Error(`Evidence already exists: ${evidence.id}`);
  return { ...state, evidence: [...state.evidence, evidence], updatedAt: new Date().toISOString() };
}

export function addHypothesis(state: StrategicState, hypothesis: StrategicHypothesis): StrategicState {
  const known = new Set(state.evidence.map(e => e.id));
  if (hypothesis.evidenceIds.some(id => !known.has(id))) throw new Error("Hypothesis references unknown evidence");
  return { ...state, activeHypotheses: [...state.activeHypotheses, hypothesis], updatedAt: new Date().toISOString() };
}

export function addDecision(state: StrategicState, decision: StrategicDecision): StrategicState {
  const knownEvidence = new Set(state.evidence.map(e => e.id));
  const knownHypotheses = new Set(state.activeHypotheses.map(h => h.id));
  if (decision.evidenceIds.some(id => !knownEvidence.has(id))) throw new Error("Decision references unknown evidence");
  if ((decision.hypothesisIds ?? []).some(id => !knownHypotheses.has(id))) throw new Error("Decision references unknown hypothesis");
  return { ...state, decisions: [...state.decisions, decision], updatedAt: new Date().toISOString() };
}

export function recommendNextActions(state: StrategicState): string[] {
  const actions: string[] = [];
  const testing = state.activeHypotheses.filter(h => h.status === "testing");
  if (testing.length) actions.push(`Measure active hypothesis results: ${testing.map(h => h.id).join(", ")}`);
  if (!state.audienceIds.length) actions.push("Research and define target audience segments");
  if (!state.positioning) actions.push("Establish positioning from validated evidence");
  if (!state.offerIds.length) actions.push("Define the primary offer");
  if (!state.evidence.length) actions.push("Collect initial market and customer evidence");
  return actions;
}
