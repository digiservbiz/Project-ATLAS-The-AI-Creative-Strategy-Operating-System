import type { BusinessIntelligenceModel } from "./business-intelligence-model";
import type { StrategicState } from "./strategic-state";
import { recommendNextActions } from "./evidence-decision-pipeline";
import { generateNextBestActions, type NextBestAction } from "./next-best-action";
import type { LearningRecord } from "./learning-loop";
import { applyLearning } from "./strategic-learning-integration";

export interface IntelligenceSignals { continuityScore?:number; fatigueScore?:number; offerWeakness?:boolean; funnelDiagnosis?:string; angleGap?:boolean; learningConfidence?:number; }
export interface IntelligenceSnapshot { business:BusinessIntelligenceModel; state:StrategicState; nextBestActions:NextBestAction[]; }

export function buildIntelligenceSnapshot(business:BusinessIntelligenceModel,state:StrategicState,signals:IntelligenceSignals={}):IntelligenceSnapshot {
  if(business.business.id!==state.businessId) throw new Error("Business model and strategic state belong to different businesses");
  const base=recommendNextActions(state).map((action,i)=>({id:`state:${i}`,type:"investigate_anomaly" as const,action,reason:"Strategic state requires attention",evidence:[],expectedImpact:.5,confidence:state.confidence,risk:"low" as const,requiredApproval:false,priority:50}));
  return {business,state,nextBestActions:[...base,...generateNextBestActions(signals)].sort((a,b)=>b.priority-a.priority)};
}

export function ingestLearning(snapshot:IntelligenceSnapshot,learning:LearningRecord):IntelligenceSnapshot {
  const state=applyLearning(snapshot.state,learning);
  return buildIntelligenceSnapshot(snapshot.business,state);
}
