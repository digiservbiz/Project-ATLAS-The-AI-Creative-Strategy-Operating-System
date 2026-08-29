import type { LearningRecord } from "./learning-loop";
import type { StrategicState } from "./strategic-state";

export function applyLearning(state: StrategicState, learning: LearningRecord): StrategicState {
  if (learning.businessId !== state.businessId) throw new Error("Learning belongs to a different business");
  const entry = `${learning.statement} (confidence=${learning.confidence.toFixed(2)}, sample=${learning.sampleSize})`;
  return { ...state, knownLearnings: [...state.knownLearnings.filter(x => !x.startsWith(`[${learning.hypothesisId}]`)), `[${learning.hypothesisId}] ${entry}`], activeHypotheses: state.activeHypotheses.map(h => h.id === learning.hypothesisId ? { ...h, status: learning.status } : h), updatedAt: new Date().toISOString() };
}

export function refreshNextActions(state: StrategicState): StrategicState {
  const actions = [...state.recommendedNextActions];
  const active = state.activeHypotheses.filter(h => h.status === "testing");
  if (!active.length && state.activeHypotheses.length) actions.push("Review completed hypothesis outcomes and propose the next highest-value experiment");
  return { ...state, recommendedNextActions: [...new Set(actions)], updatedAt: new Date().toISOString() };
}
