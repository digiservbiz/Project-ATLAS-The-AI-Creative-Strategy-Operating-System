export interface ModelRequest {
  model: string;
  system?: string;
  input: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ModelResponse {
  text: string;
  provider: string;
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

export interface ModelProvider {
  readonly providerId: string;
  generate(request: ModelRequest): Promise<ModelResponse>;
}

export class ModelGateway {
  private readonly providers = new Map<string, ModelProvider>();

  register(provider: ModelProvider): void {
    if (this.providers.has(provider.providerId)) {
      throw new Error(`Model provider already registered: ${provider.providerId}`);
    }
    this.providers.set(provider.providerId, provider);
  }

  get(providerId: string): ModelProvider {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error(`Model provider not registered: ${providerId}`);
    return provider;
  }

  generate(providerId: string, request: ModelRequest): Promise<ModelResponse> {
    return this.get(providerId).generate(request);
  }
}

export { AnthropicProvider } from "./anthropic.js";
