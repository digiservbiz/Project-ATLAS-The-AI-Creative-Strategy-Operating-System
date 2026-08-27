export interface SecretStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface SecretProvider {
  getSecret(key: string): Promise<string | null>;
  putSecret(key: string, value: string): Promise<void>;
  deleteSecret(key: string): Promise<void>;
}

export class ProviderBackedSecretStore implements SecretStore {
  constructor(private readonly provider: SecretProvider) {}
  get(key: string) { return this.provider.getSecret(key); }
  set(key: string, value: string) { return this.provider.putSecret(key, value); }
  delete(key: string) { return this.provider.deleteSecret(key); }
}

export class EnvironmentSecretProvider implements SecretProvider {
  async getSecret(key: string) { return process.env[key] ?? null; }
  async putSecret(_key: string, _value: string) { throw new Error("EnvironmentSecretProvider is read-only"); }
  async deleteSecret(_key: string) { throw new Error("EnvironmentSecretProvider is read-only"); }
}
