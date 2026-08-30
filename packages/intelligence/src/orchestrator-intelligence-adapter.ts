import type { IntelligenceSnapshot, IntelligenceSignals } from "./intelligence-hub";

export type WorkflowType="research"|"audience_research"|"creative_test"|"offer_optimization"|"landing_page_optimization"|"competitive_research"|"market_research"|"analysis"|"retention";
export interface WorkflowDecision { workflow:WorkflowType; reason:string; priority:number; confidence:number; requiresApproval:boolean; actionId?:string; }
export interface OrchestratorIntelligenceContext { snapshot:IntelligenceSnapshot; signals:IntelligenceSignals; }

export function selectNextWorkflow(ctx:OrchestratorIntelligenceContext):WorkflowDecision {
  const actions=ctx.snapshot.nextBestActions;
  const top=actions[0];
  if(!top) return {workflow:"research",reason:"No actionable intelligence is available; collect evidence first",priority:100,confidence:.5,requiresApproval:false};
  const type=top.type;
  if(type==="research_audience") return {workflow:"audience_research",reason:top.reason,priority:top.priority,confidence:top.confidence,requiresApproval:top.requiredApproval,actionId:top.id};
  if(type==="test_angle") return {workflow:"creative_test",reason:top.reason,priority:top.priority,confidence:top.confidence,requiresApproval:top.requiredApproval,actionId:top.id};
  if(type==="improve_offer") return {workflow:"offer_optimization",reason:top.reason,priority:top.priority,confidence:top.confidence,requiresApproval:top.requiredApproval,actionId:top.id};
  if(type==="fix_message_continuity") return {workflow:"landing_page_optimization",reason:top.reason,priority:top.priority,confidence:top.confidence,requiresApproval:top.requiredApproval,actionId:top.id};
  if(type==="replace_fatigued_creative") return {workflow:"creative_test",reason:top.reason,priority:top.priority,confidence:top.confidence,requiresApproval:top.requiredApproval,actionId:top.id};
  if(type==="investigate_anomaly") return {workflow:"analysis",reason:top.reason,priority:top.priority,confidence:top.confidence,requiresApproval:top.requiredApproval,actionId:top.id};
  if(type==="test_platform") return {workflow:"market_research",reason:top.reason,priority:top.priority,confidence:top.confidence,requiresApproval:top.requiredApproval,actionId:top.id};
  if(type==="adjust_budget") return {workflow:"analysis",reason:top.reason,priority:top.priority,confidence:top.confidence,requiresApproval:true,actionId:top.id};
  return {workflow:"analysis",reason:top.reason,priority:top.priority,confidence:top.confidence,requiresApproval:top.requiredApproval,actionId:top.id};
}
