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
  ) {}

  async generate(request: ModelRequest): Promise<ModelResponse> {
    if (!this.apiKey) throw new Error("ANTHROPIC_API_KEY is required");

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
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
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${detail}`);
    }

    const data = (await response.json()) as AnthropicMessageResponse;
    const text = (data.content ?? [])
      .filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join("\n");

    return {
      text,
      provider: this.providerId,
      model: data.model ?? request.model,
      usage: {
        inputTokens: data.usage?.input_tokens,
        outputTokens: data.usage?.output_tokens,
      },
    };
  }
}
