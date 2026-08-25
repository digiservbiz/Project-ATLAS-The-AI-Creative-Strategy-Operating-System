export interface SecretBackend { read(key: string): Promise<string | null>; write(key: string, value: string): Promise<void>; remove?(key: string): Promise<void>; }

/** Adapter boundary for a production secret manager (Vault, AWS Secrets Manager, GCP Secret Manager, etc.). */
export class SecretStoreAdapter {
  constructor(private readonly backend: SecretBackend) {}
  get(key: string) { return this.backend.read(key); }
  set(key: string, value: string) { return this.backend.write(key, value); }
  delete(key: string) { return this.backend.remove?.(key); }
}
