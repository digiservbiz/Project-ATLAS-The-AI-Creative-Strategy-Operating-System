import type { Platform, PlatformRequest, PlatformResponse, PlatformTransport } from "./platform-transports";

export type Operation = "create_campaign" | "update_campaign" | "pause_campaign" | "resume_campaign" | "create_creative" | "publish_creative" | "fetch_metrics";
export interface PlatformOperation { id: string; platform: Platform; operation: Operation; externalAccountId: string; path: string; method: PlatformRequest["method"]; body?: unknown; query?: Record<string,string>; requiresApproval: boolean; idempotencyKey?: string; }
export interface ApprovalGate { assertApproved(operation: PlatformOperation): Promise<void>; }
export interface OperationResult<T = unknown> { operationId: string; platform: Platform; status: number; data: T; }

export class PlatformOperationExecutor {
  constructor(private readonly transports: Map<Platform, PlatformTransport>, private readonly approval: ApprovalGate) {}
  async execute<T>(operation: PlatformOperation, accessToken: string): Promise<OperationResult<T>> {
    if (operation.requiresApproval) await this.approval.assertApproved(operation);
    const transport = this.transports.get(operation.platform);
    if (!transport) throw new Error(`No transport configured for ${operation.platform}`);
    const response: PlatformResponse<T> = await transport.request<T>({ method: operation.method, path: operation.path, query: operation.query, body: operation.body }, accessToken);
    if (response.status >= 400) throw new Error(`Platform operation failed: ${operation.platform} ${response.status}`);
    return { operationId: operation.id, platform: operation.platform, status: response.status, data: response.data };
  }
}
