import type { CreativeJob } from "./job-orchestrator";

export type CreativeDecision = "approved" | "needs_review" | "rejected";

export interface CreativeQaResult { jobId: string; decision: CreativeDecision; score: number; reasons: string[]; claimsChecked: string[]; }

export interface CreativeQaPolicy { minScore: number; requireAsset: boolean; }

export class CreativeQaEngine {
  constructor(private readonly policy: CreativeQaPolicy = { minScore: 0.8, requireAsset: true }) {}

  evaluate(job: CreativeJob, allowedClaims: string[] = []): CreativeQaResult {
    const reasons: string[] = [];
    if (job.status !== "completed") reasons.push(`Job is ${job.status}`);
    if (this.policy.requireAsset && !job.result?.assetUrl) reasons.push("Generated asset is missing");
    const score = reasons.length === 0 ? 1 : Math.max(0, 1 - reasons.length * 0.35);
    const decision: CreativeDecision = score < 0.5 ? "rejected" : score < this.policy.minScore ? "needs_review" : "approved";
    return { jobId: job.id, decision, score, reasons, claimsChecked: allowedClaims };
  }
}
