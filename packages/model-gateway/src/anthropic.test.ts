import { afterEach, describe, expect, it, vi } from "vitest";
import { AnthropicProvider } from "./anthropic.js";

const request = {
  model: "claude-test-model",
  system: "You are ATLAS.",
  input: "Create a product positioning angle.",
  maxTokens: 256,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AnthropicProvider", () => {
  it("sends a request and normalizes text and token usage", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      content: [{ type: "text", text: "A clear positioning angle." }],
      model: "claude-test-model",
      usage: { input_tokens: 12, output_tokens: 8 },
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new AnthropicProvider("test-key").generate(request);

    expect(result).toEqual({
      text: "A clear positioning angle.",
      provider: "anthropic",
      model: "claude-test-model",
      usage: { inputTokens: 12, outputTokens: 8 },
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(new Headers(init.headers).get("x-api-key")).toBe("test-key");
    expect(JSON.parse(String(init.body))).toMatchObject({
      model: request.model,
      system: request.system,
      max_tokens: 256,
      messages: [{ role: "user", content: request.input }],
    });
  });

  it("does not make a network request when credentials are missing", async () => {
    await expect(new AnthropicProvider(undefined).generate(request))
      .rejects.toThrow("ANTHROPIC_API_KEY is required");
  });

  it("rejects invalid generation parameters", async () => {
    const provider = new AnthropicProvider("test-key");
    await expect(provider.generate({ ...request, maxTokens: 0 }))
      .rejects.toThrow("MODEL_MAX_TOKENS_INVALID");
    await expect(provider.generate({ ...request, temperature: 1.5 }))
      .rejects.toThrow("MODEL_TEMPERATURE_INVALID");
  });

  it("classifies rate limits without exposing provider response bodies", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response("sensitive provider response body", { status: 429 }),
    ));

    await expect(new AnthropicProvider("test-key").generate(request))
      .rejects.toThrow("MODEL_RATE_LIMITED:anthropic");
  });

  it("rejects empty model responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: [] }), { status: 200 }),
    ));

    await expect(new AnthropicProvider("test-key").generate(request))
      .rejects.toThrow("MODEL_RESPONSE_EMPTY:anthropic");
  });

  it("classifies server errors as retryable provider unavailability", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response("provider error", { status: 503 }),
    ));

    await expect(new AnthropicProvider("test-key").generate(request))
      .rejects.toThrow("MODEL_PROVIDER_UNAVAILABLE:anthropic");
  });
});
