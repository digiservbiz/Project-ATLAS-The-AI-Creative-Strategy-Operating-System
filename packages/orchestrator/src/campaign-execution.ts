import type { AgentContext } from "./types";
import type { StrategyDecision } from "./strategy-decision";
import type { ApprovalStore } from "./approval-workflow";

export interface CampaignOperation { platform: "meta" | "tiktok" | "google"; action: "create" | "update" | "pause" | "resume"; payload: Record<string, unknown>; }
export interface CampaignExecutor { execute(context: AgentContext, operation: CampaignOperation): Promise<{ operationId: string; status: "executed" }>; }

export class ApprovedCampaignExecutor {
  constructor(private readonly approvals: ApprovalStore, private readonly executor: CampaignExecutor) {}

  async execute(context: AgentContext, approvalId: string, decision: StrategyDecision, operation: CampaignOperation) {
    const approval = await this.approvals.get(approvalId);
    if (!approval) throw new Error("Approval request not found");
    if (approval.organizationId !== context.organizationId) throw new Error("Approval belongs to another organization");
    if (approval.decisionId !== decision.decisionId) throw new Error("Approval does not match strategy decision");
    if (approval.status !== "approved") throw new Error("Campaign execution requires an approved strategy");
    return this.executor.execute(context, operation);
  }
}
