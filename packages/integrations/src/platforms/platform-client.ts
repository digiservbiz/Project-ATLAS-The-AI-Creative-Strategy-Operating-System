export interface PlatformRequest { method: "GET" | "POST" | "PUT" | "DELETE"; path: string; query?: Record<string, string | number | boolean | undefined>; body?: unknown; }
export interface PlatformResponse<T> { data: T; status: number; headers: Record<string, string | undefined>; }
export interface PlatformTransport { request<T>(request: PlatformRequest, accessToken: string): Promise<PlatformResponse<T>>; }
export interface PlatformClient { get<T>(path: string, query?: PlatformRequest["query"]): Promise<T>; post<T>(path: string, body?: unknown): Promise<T>; }

export abstract class AuthenticatedPlatformClient implements PlatformClient {
  constructor(protected readonly transport: PlatformTransport, protected readonly accessToken: string) {}
  async get<T>(path: string, query?: PlatformRequest["query"]) { return (await this.transport.request<T>({ method: "GET", path, query }, this.accessToken)).data; }
  async post<T>(path: string, body?: unknown) { return (await this.transport.request<T>({ method: "POST", path, body }, this.accessToken)).data; }
}
