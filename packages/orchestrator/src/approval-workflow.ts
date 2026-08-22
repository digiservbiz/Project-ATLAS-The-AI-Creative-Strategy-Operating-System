import type { AgentContext } from "./types";
import type { StrategyDecision } from "./strategy-decision";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalRequest {
  id: string;
  organizationId: string;
  decisionId: string;
  status: ApprovalStatus;
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  note?: string;
}

export interface ApprovalStore {
  save(request: ApprovalRequest): Promise<void>;
  get(id: string): Promise<ApprovalRequest | undefined>;
}

export class ApprovalWorkflow {
  constructor(private readonly store: ApprovalStore) {}

  async request(context: AgentContext, decision: StrategyDecision): Promise<ApprovalRequest> {
    const request: ApprovalRequest = {
      id: `approval:${decision.decisionId}`,
      organizationId: context.organizationId,
      decisionId: decision.decisionId,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };
    await this.store.save(request);
    return request;
  }

  async resolve(id: string, status: "approved" | "rejected", resolvedBy: string, note?: string): Promise<ApprovalRequest> {
    const existing = await this.store.get(id);
    if (!existing) throw new Error("Approval request not found");
    if (existing.status !== "pending") throw new Error("Approval request is already resolved");
    const resolved = { ...existing, status, resolvedAt: new Date().toISOString(), resolvedBy, note };
    await this.store.save(resolved);
    return resolved;
  }
}
