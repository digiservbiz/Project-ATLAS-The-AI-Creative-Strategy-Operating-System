import { describe, expect, it } from "vitest";
import { ApprovalWorkflow, type ApprovalRequest, type ApprovalStore } from "./approval-workflow";

class MemoryApprovalStore implements ApprovalStore {
  values = new Map<string, ApprovalRequest>();
  async save(value: ApprovalRequest) { this.values.set(value.id, value); }
  async get(id: string) { return this.values.get(id); }
}

describe("ApprovalWorkflow", () => {
  it("requires human resolution before execution can proceed", async () => {
    const store = new MemoryApprovalStore();
    const workflow = new ApprovalWorkflow(store);
    const request = await workflow.request({ organizationId: "org-1" } as never, { decisionId: "strategy:1", organizationId: "org-1", objective: "increase purchases", rationale: "evidence", evidence: [], confidence: 0.8, createdAt: new Date().toISOString() });
    expect(request.status).toBe("pending");
    const resolved = await workflow.resolve(request.id, "approved", "user-1");
    expect(resolved.status).toBe("approved");
    await expect(workflow.resolve(request.id, "rejected", "user-2")).rejects.toThrow("already resolved");
  });
});
