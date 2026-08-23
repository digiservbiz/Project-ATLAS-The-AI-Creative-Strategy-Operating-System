export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalSubject = "strategy" | "creative" | "campaign";

export interface ApprovalRequest { id: string; subject: ApprovalSubject; subjectId: string; requestedBy: string; status: ApprovalStatus; createdAt: string; decidedAt?: string; decidedBy?: string; reason?: string; }

export interface ApprovalStore { save(request: ApprovalRequest): Promise<void>; get(id: string): Promise<ApprovalRequest | undefined>; }

export class ApprovalGate {
  constructor(private readonly store: ApprovalStore) {}

  async request(subject: ApprovalSubject, subjectId: string, requestedBy: string): Promise<ApprovalRequest> {
    const request: ApprovalRequest = { id: `approval:${subject}:${subjectId}:${Date.now()}`, subject, subjectId, requestedBy, status: "pending", createdAt: new Date().toISOString() };
    await this.store.save(request);
    return request;
  }

  async decide(id: string, decision: "approved" | "rejected", decidedBy: string, reason?: string): Promise<ApprovalRequest> {
    const request = await this.store.get(id);
    if (!request) throw new Error(`Approval request not found: ${id}`);
    if (request.status !== "pending") throw new Error(`Approval request is already ${request.status}`);
    request.status = decision;
    request.decidedAt = new Date().toISOString();
    request.decidedBy = decidedBy;
    request.reason = reason;
    await this.store.save(request);
    return request;
  }

  async assertApproved(id: string): Promise<void> {
    const request = await this.store.get(id);
    if (!request || request.status !== "approved") throw new Error("Execution requires an approved request");
  }
}
