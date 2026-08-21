import { MetaApiError, withMetaRetry } from "./retry";

export interface MetaHttpResponse {
  status: number;
  headers: Record<string, string | undefined>;
  json(): Promise<Record<string, unknown>>;
}

export interface MetaHttpTransport {
  request(method: "GET" | "POST", url: string, options?: { body?: Record<string, unknown> }): Promise<MetaHttpResponse>;
}

export class MetaGraphTransport {
  constructor(
    private readonly http: MetaHttpTransport,
    private readonly accessToken: string,
    private readonly graphBaseUrl: string,
    private readonly maxAttempts = 3,
  ) {}

  async get(path: string, params: Record<string, string> = {}) {
    return this.request("GET", path, params);
  }

  async post(path: string, body: Record<string, unknown> = {}) {
    return this.request("POST", path, body);
  }

  private async request(method: "GET" | "POST", path: string, payload: Record<string, string | unknown>) {
    return withMetaRetry(async () => {
      const url = new URL(path.startsWith("http") ? path : `${this.graphBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`);
      if (method === "GET") {
        for (const [key, value] of Object.entries(payload)) url.searchParams.set(key, String(value));
        url.searchParams.set("access_token", this.accessToken);
      }

      const response = await this.http.request(
        method,
        url.toString(),
        method === "POST" ? { body: { ...payload, access_token: this.accessToken } } : undefined,
      );
      const data = await response.json();
      if (response.status >= 200 && response.status < 300) return data;

      const errorPayload = (data.error ?? {}) as Record<string, unknown>;
      const retryable = response.status === 429 || response.status >= 500;
      throw new MetaApiError(
        String(errorPayload.message ?? `Meta Graph API request failed: ${response.status}`),
        response.status,
        retryable,
      );
    }, { maxAttempts: this.maxAttempts });
  }
}
