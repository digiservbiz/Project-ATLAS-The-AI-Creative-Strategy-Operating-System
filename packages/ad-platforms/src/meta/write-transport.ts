export interface MetaWriteResponse { id?: string; success?: boolean; }

export interface MetaWriteHttpClient {
  post(path: string, body: Record<string, string>): Promise<MetaWriteResponse>;
}

export class MetaGraphWriteTransport {
  constructor(private readonly http: MetaWriteHttpClient, private readonly accessToken: string) {
    if (!accessToken) throw new Error("Meta access token is required");
  }

  post(path: string, body: Record<string, unknown>): Promise<MetaWriteResponse> {
    const encoded = Object.fromEntries(Object.entries({ ...body, access_token: this.accessToken }).map(([key, value]) => [key, String(value)]));
    return this.http.post(path, encoded);
  }
}
