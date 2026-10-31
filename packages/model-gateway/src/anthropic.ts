import type { ModelProvider, ModelRequest, ModelResponse } from "./index.js";

interface AnthropicMessageResponse {
  content?: Array<{ type?: string; text?: string }>;
  model?: string;
  usage?: { input_tokens?: number; output_tokens?: number };
}

export class AnthropicProvider implements ModelProvider {
  readonly providerId = "anthropic";

  constructor(
    private readonly apiKey = process.env.ANTHROPIC_API_KEY,
    private readonly baseUrl = "https://api.anthropic.com",
    private readonly timeoutMs = 60_000,
  ) {}

  async generate(request: ModelRequest): Promise<ModelResponse> {
    if (!this.apiKey) throw new Error("ANTHROPIC_API_KEY is required");
    if (!request.model?.trim()) throw new Error("MODEL_NAME_REQUIRED");
    if (!request.input?.trim()) throw new Error("MODEL_INPUT_REQUIRED");
    if (request.maxTokens !== undefined && (!Number.isInteger(request.maxTokens) || request.maxTokens < 1)) {
      throw new Error("MODEL_MAX_TOKENS_INVALID");
    }
    if (request.temperature !== undefined && (!Number.isFinite(request.temperature) || request.temperature < 0 || request.temperature > 1)) {
      throw new Error("MODEL_TEMPERATURE_INVALID");
    }
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs < 1) {
      throw new Error("MODEL_TIMEOUT_CONFIGURATION_INVALID");
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.maxTokens ?? 2048,
          ...(request.system ? { system: request.system } : {}),
          messages: [{ role: "user", content: request.input }],
          ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error("MODEL_TIMEOUT:anthropic");
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("MODEL_ABORTED:anthropic");
      }
      throw new Error("MODEL_PROVIDER_UNAVAILABLE:anthropic");
    }

    if (!response.ok) {
      if (response.status === 429) throw new Error("MODEL_RATE_LIMITED:anthropic");
      if (response.status >= 500) throw new Error("MODEL_PROVIDER_UNAVAILABLE:anthropic");
      throw new Error(`MODEL_REQUEST_REJECTED:anthropic:${response.status}`);
    }

    let data: AnthropicMessageResponse;
    try {
      data = (await response.json()) as AnthropicMessageResponse;
    } catch {
      throw new Error("MODEL_RESPONSE_INVALID:anthropic");
    }

    const text = (data.content ?? [])
      .filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join("\n")
      .trim();

    if (!text) throw new Error("MODEL_RESPONSE_EMPTY:anthropic");

    const usage = data.usage
      ? {
          ...(data.usage.input_tokens === undefined
            ? {}
            : { inputTokens: data.usage.input_tokens }),
          ...(data.usage.output_tokens === undefined
            ? {}
            : { outputTokens: data.usage.output_tokens }),
        }
      : undefined;

    return {
      text,
      provider: this.providerId,
      model: data.model ?? request.model,
      ...(usage ? { usage } : {}),
    };
  }
}
