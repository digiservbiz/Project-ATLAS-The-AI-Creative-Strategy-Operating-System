import type { MetaSyncTransport } from "./sync";
import type { CampaignOperation } from "@atlas/orchestrator";

export interface MetaExecutionResult { operationId: string; status: "executed"; platformObjectId?: string; }

export class MetaCampaignExecutor {
  constructor(private readonly transport: MetaSyncTransport) {}

  async execute(operation: CampaignOperation): Promise<MetaExecutionResult> {
    if (operation.platform !== "meta") throw new Error("MetaCampaignExecutor only accepts Meta operations");
    const payload = operation.payload;
    if (operation.action === "create") {
      const response = await this.transport.get("me/adcreatives", { method: "POST", ...Object.fromEntries(Object.entries(payload).map(([k,v]) => [k, String(v)])) });
      const id = typeof response.id === "string" ? response.id : undefined;
      return { operationId: `meta:create:${id ?? Date.now()}`, status: "executed", platformObjectId: id };
    }
    const objectId = typeof payload.objectId === "string" ? payload.objectId : "";
    if (!objectId) throw new Error("Meta operation requires payload.objectId");
    if (!["update", "pause", "resume"].includes(operation.action)) throw new Error(`Unsupported Meta action: ${operation.action}`);
    const response = await this.transport.get(objectId, { method: "POST", status: operation.action === "pause" ? "PAUSED" : operation.action === "resume" ? "ACTIVE" : "" });
    return { operationId: `meta:${operation.action}:${objectId}`, status: "executed", platformObjectId: typeof response.id === "string" ? response.id : objectId };
  }
}
