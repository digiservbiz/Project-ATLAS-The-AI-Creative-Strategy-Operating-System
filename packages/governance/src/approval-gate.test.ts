import { describe, expect, it } from "vitest";
import { ApprovalGate, type ApprovalRequest } from "./approval-gate";

describe("ApprovalGate", () => {
  it("blocks execution until approval", async () => {
    const store = new Map<string, ApprovalRequest>();
    const gate = new ApprovalGate({ async save(request) { store.set(request.id, { ...request }); }, async get(id) { return store.get(id); } });
    const request = await gate.request("campaign", "campaign-1", "atlas");
    await expect(gate.assertApproved(request.id)).rejects.toThrow("Execution requires an approved request");
    await gate.decide(request.id, "approved", "owner");
    await expect(gate.assertApproved(request.id)).resolves.toBeUndefined();
  });

  it("does not allow a second decision", async () => {
    const store = new Map<string, ApprovalRequest>();
    const gate = new ApprovalGate({ async save(request) { store.set(request.id, { ...request }); }, async get(id) { return store.get(id); } });
    const request = await gate.request("creative", "creative-1", "atlas");
    await gate.decide(request.id, "rejected", "owner", "needs changes");
    await expect(gate.decide(request.id, "approved", "owner")).rejects.toThrow("already rejected");
  });
});
