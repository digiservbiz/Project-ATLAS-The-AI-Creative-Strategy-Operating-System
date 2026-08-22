import type { CampaignOperation } from "@atlas/orchestrator";

export interface MetaWriteTransport {
  request(method: "POST", path: string, params?: Record<string, string>): Promise<{ id?: string; [key: string]: unknown }>;
}

export class MetaCampaignWriteExecutor {
  constructor(private readonly transport: MetaWriteTransport) {}

  async execute(operation: CampaignOperation): Promise<{ operationId: string; status: "executed"; platformObjectId?: string }> {
    if (operation.platform !== "meta") throw new Error("MetaCampaignWriteExecutor only accepts Meta operations");
    const payload = Object.fromEntries(Object.entries(operation.payload).map(([key, value]) => [key, String(value)]));

    if (operation.action === "create") {
      const response = await this.transport.request("POST", "me/adcreatives", payload);
      return { operationId: `meta:create:${response.id ?? Date.now()}`, status: "executed", platformObjectId: response.id };
    }

    const objectId = typeof operation.payload.objectId === "string" ? operation.payload.objectId : "";
    if (!objectId) throw new Error("Meta operation requires payload.objectId");
    if (operation.action === "pause") payload.status = "PAUSED";
    if (operation.action === "resume") payload.status = "ACTIVE";
    delete payload.objectId;

    if (operation.action !== "update" && operation.action !== "pause" && operation.action !== "resume") {
      throw new Error(`Unsupported Meta action: ${operation.action}`);
    }
    const response = await this.transport.request("POST", objectId, payload);
    return { operationId: `meta:${operation.action}:${objectId}`, status: "executed", platformObjectId: response.id ?? objectId };
  }
}
