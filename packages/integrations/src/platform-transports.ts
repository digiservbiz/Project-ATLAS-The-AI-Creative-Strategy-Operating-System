export type Platform = "meta" | "tiktok" | "shopify";
export interface PlatformRequest { method: "GET" | "POST" | "PUT" | "DELETE"; path: string; query?: Record<string,string>; body?: unknown; }
export interface PlatformResponse<T = unknown> { status: number; data: T; headers?: Record<string,string>; }
export interface PlatformTransport { readonly platform: Platform; request<T = unknown>(request: PlatformRequest, accessToken: string): Promise<PlatformResponse<T>>; }
export interface HttpTransport { request<T = unknown>(input: { method: PlatformRequest["method"]; url: string; headers: Record<string,string>; query?: Record<string,string>; body?: unknown }): Promise<PlatformResponse<T>>; }

abstract class BasePlatformTransport implements PlatformTransport {
  abstract readonly platform: Platform;
  constructor(protected readonly baseUrl: string, protected readonly http: HttpTransport) {}
  request<T>(request: PlatformRequest, accessToken: string) {
    return this.http.request<T>({ method: request.method, url: `${this.baseUrl}${request.path}`, query: request.query, body: request.body, headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", Accept: "application/json" } });
  }
}

export class MetaPlatformTransport extends BasePlatformTransport { readonly platform = "meta" as const; }
export class TikTokPlatformTransport extends BasePlatformTransport { readonly platform = "tiktok" as const; }
export class ShopifyPlatformTransport extends BasePlatformTransport { readonly platform = "shopify" as const; }

export class PlatformTransportRegistry {
  private readonly transports = new Map<Platform, PlatformTransport>();
  register(transport: PlatformTransport) { this.transports.set(transport.platform, transport); return this; }
  get(platform: Platform) { const transport = this.transports.get(platform); if (!transport) throw new Error(`No transport registered for ${platform}`); return transport; }
}
