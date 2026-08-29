export type FunnelStage="awareness"|"consideration"|"conversion"|"retention";
export type FunnelDiagnosis="audience_mismatch"|"creative_weakness"|"offer_weakness"|"landing_page_weakness"|"checkout_friction"|"retention_weakness"|"healthy"|"insufficient_data";
export interface FunnelStageMetrics { visitors?:number; engaged?:number; leads?:number; conversions?:number; retained?:number; revenue?:number; }
export interface FunnelAssessment { stage:FunnelStage; rate:number; diagnosis:FunnelDiagnosis; evidence:string[]; confidence:number; }
export interface FunnelIntelligenceInput { awareness:FunnelStageMetrics; consideration:FunnelStageMetrics; conversion:FunnelStageMetrics; retention:FunnelStageMetrics; }
const rate=(a?:number,b?:number)=>a!==undefined&&b&&b>0?Math.max(0,Math.min(1,a/b)):undefined;
export function assessFunnel(input:FunnelIntelligenceInput):FunnelAssessment[]{const out:FunnelAssessment[]=[];const push=(stage:FunnelStage,r:number|undefined,diagnosis:FunnelDiagnosis,evidence:string[])=>out.push({stage,rate:r??0,diagnosis:r===undefined?"insufficient_data":diagnosis,evidence,confidence:r===undefined?.2:.5+r*.49});
 push("awareness",rate(input.awareness.engaged,input.awareness.visitors),"creative_weakness",["Awareness engagement rate");
 push("consideration",rate(input.consideration.leads,input.consideration.engaged),"offer_weakness",["Consideration lead rate"]);
 push("conversion",rate(input.conversion.conversions,input.conversion.visitors),"landing_page_weakness",["Conversion rate"]);
 push("retention",rate(input.retention.retained,input.retention.conversions),"retention_weakness",["Retention rate"]); return out; }
