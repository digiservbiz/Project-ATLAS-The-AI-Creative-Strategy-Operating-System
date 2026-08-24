export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalSubject = "strategy" | "creative" | "campaign";

export interface ApprovalRequest { id: string; workflowId?: string; subject: ApprovalSubject; subjectId: string; requestedBy: string; status: ApprovalStatus; risk: RiskLevel; summary?: string; payload?: Record<string, unknown>; createdAt: string; decidedAt?: string; decidedBy?: string; reason?: string; }
export interface ApprovalStore { save(request: ApprovalRequest): Promise<void>; get(id: string): Promise<ApprovalRequest | undefined>; }

export class ApprovalGate {
  constructor(private readonly store: ApprovalStore) {}

  async request(input: Omit<ApprovalRequest, "id" | "createdAt" | "status">): Promise<ApprovalRequest> {
    const request: ApprovalRequest = { ...input, id: `approval:${input.subject}:${input.subjectId}:${Date.now()}`, status: "pending", createdAt: new Date().toISOString() };
    await this.store.save(request);
    return request;
  }

  async decide(id: string, decision: "approved" | "rejected", decidedBy: string, reason?: string): Promise<ApprovalRequest> {
    const request = await this.store.get(id);
    if (!request) throw new Error(`Approval request not found: ${id}`);
    if (request.status !== "pending") throw new Error(`Approval request is already ${request.status}`);
    const updated = { ...request, status: decision, decidedAt: new Date().toISOString(), decidedBy, reason };
    await this.store.save(updated);
    return updated;
  }

  async assertApproved(id: string): Promise<void> {
    const request = await this.store.get(id);
    if (!request || request.status !== "approved") throw new Error("Execution requires an approved request");
  }

  static riskForAction(action: string, budget?: number): RiskLevel {
    if (/launch|publish|spend|delete|billing/i.test(action)) return budget !== undefined && budget >= 1000 ? "critical" : "high";
    if (/modify|optimize|change/i.test(action)) return "medium";
    return "low";
  }
}
