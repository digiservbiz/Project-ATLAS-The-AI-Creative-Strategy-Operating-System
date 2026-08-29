import type { Platform, ProviderRequest, ProviderResponse, ProviderTransport } from "./provider-transports";

export interface ApprovedExecution { approvalId: string; platform: Platform; path: string; method: ProviderRequest["method"]; body?: unknown; query?: Record<string,string|number|boolean>; }
export interface ExecutionResult { platform: Platform; status: number; data: unknown; }
export interface ApprovalVerifier { verify(approvalId: string): Promise<boolean>; }

export class PlatformExecutionBridge {
  constructor(private readonly transports: Partial<Record<Platform, ProviderTransport>>, private readonly approvals: ApprovalVerifier) {}
  async execute(command: ApprovedExecution): Promise<ExecutionResult> {
    if (!(await this.approvals.verify(command.approvalId))) throw new Error(`Execution approval rejected: ${command.approvalId}`);
    const transport = this.transports[command.platform];
    if (!transport) throw new Error(`No transport configured for ${command.platform}`);
    const response: ProviderResponse = await transport.request({ method: command.method, path: command.path, body: command.body, query: command.query });
    return { platform: command.platform, status: response.status, data: response.data };
  }
}
