import { describe, expect, it } from "vitest";
import { ApprovedCampaignExecutor } from "./campaign-execution";
import type { ApprovalRequest, ApprovalStore } from "./approval-workflow";

class Store implements ApprovalStore {
  constructor(private value: ApprovalRequest) {}
  async save(value: ApprovalRequest) { this.value = value; }
  async get() { return this.value; }
}

describe("ApprovedCampaignExecutor", () => {
  const decision = { decisionId: "strategy:1", organizationId: "org-1", objective: "sales", rationale: "evidence", evidence: [], confidence: 0.8, createdAt: new Date().toISOString() } as never;
  const operation = { platform: "meta", action: "create", payload: { name: "ATLAS Test" } } as never;

  it("executes only after approval", async () => {
    const calls: unknown[] = [];
    const executor = new ApprovedCampaignExecutor(new Store({ id: "approval:strategy:1", organizationId: "org-1", decisionId: "strategy:1", status: "approved", requestedAt: new Date().toISOString() }), { async execute(_context, op) { calls.push(op); return { operationId: "op-1", status: "executed" }; } });
    const result = await executor.execute({ organizationId: "org-1" } as never, "approval:strategy:1", decision, operation);
    expect(result.status).toBe("executed");
    expect(calls).toHaveLength(1);
  });

  it("blocks pending approval", async () => {
    const executor = new ApprovedCampaignExecutor(new Store({ id: "approval:strategy:1", organizationId: "org-1", decisionId: "strategy:1", status: "pending", requestedAt: new Date().toISOString() }), { async execute() { return { operationId: "never", status: "executed" }; } });
    await expect(executor.execute({ organizationId: "org-1" } as never, "approval:strategy:1", decision, operation)).rejects.toThrow("approved");
  });
});
