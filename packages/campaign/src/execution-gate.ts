import type { CampaignSpec, CampaignExecutor } from "./campaign-assembly";
import type { ApprovalGate } from "@atlas/governance";

export interface AuditEvent { id: string; action: string; campaignId: string; actor: string; status: "started" | "succeeded" | "failed"; timestamp: string; details?: Record<string, unknown>; }
export interface AuditStore { append(event: AuditEvent): Promise<void>; }

export class CampaignExecutionGate {
  constructor(private readonly approvals: ApprovalGate, private readonly executor: CampaignExecutor, private readonly audit: AuditStore) {}

  async execute(spec: CampaignSpec, approvalId: string, actor: string) {
    await this.approvals.assertApproved(approvalId);
    const start: AuditEvent = { id: `audit:${spec.id}:start`, action: "campaign.execute", campaignId: spec.id, actor, status: "started", timestamp: new Date().toISOString() };
    await this.audit.append(start);
    try {
      const result = await this.executor.create(spec);
      await this.audit.append({ id: `audit:${spec.id}:complete`, action: "campaign.execute", campaignId: spec.id, actor, status: result.status === "created" ? "succeeded" : "failed", timestamp: new Date().toISOString(), details: { externalCampaignId: result.externalCampaignId, error: result.error } });
      return result;
    } catch (error) {
      await this.audit.append({ id: `audit:${spec.id}:failed`, action: "campaign.execute", campaignId: spec.id, actor, status: "failed", timestamp: new Date().toISOString(), details: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }
}
