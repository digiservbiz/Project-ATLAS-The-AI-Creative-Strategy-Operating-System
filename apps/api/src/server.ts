import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createAtlasApplication, type IntelligenceActionsRequest, type AutonomousRunRequest } from "./application.js";
import { createLocalAtlasComposition } from "./local-composition.js";
import { runDemo, type DemoRun } from "@atlas/demo-runner";
import { generateStrategy } from "./strategy-service.js";
import { randomUUID } from "node:crypto";
import { AgentRegistry, AgentRuntime } from "@atlas/agent-runtime";
import { createModelBackedCreativeCopyAgent } from "@atlas/agents";
import type { ExecutionEnvelope } from "@atlas/contracts";
import { AnthropicProvider } from "@atlas/model-gateway";

const port = Number(process.env.PORT ?? 3000);
const localComposition = createLocalAtlasComposition();
const application = createAtlasApplication({ autonomousLoop: localComposition.autonomousLoop });
const demoRuns = new Map<string, DemoRun>();

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && url.pathname === "/health") {
    json(response, 200, { service: "atlas-api", status: "ok", version: "local-composition" });
    return;
  }

  if (request.method === "GET" && url.pathname === "/v1/runtime/status") {
    json(response, 200, {
      service: "atlas-api",
      application: "configured",
      autonomousRuntime: "configured",
      mode: "safe-local",
      externalActions: false,
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/v1/creative/copy") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL;
    if (!apiKey || !model) {
      json(response, 503, {
        error: "MODEL_PROVIDER_NOT_CONFIGURED",
        requiredEnvironment: ["ANTHROPIC_API_KEY", "ANTHROPIC_MODEL"],
      });
      return;
    }
    try {
      const raw = await readBody(request);
      const body = (raw ? JSON.parse(raw) : {}) as {
        organizationId?: string;
        projectId?: string;
        productBrief?: Record<string, unknown> | string;
        strategy?: Record<string, unknown>;
        mode?: "hooks" | "script";
        objective?: string;
      };
      if (body.mode !== "hooks" && body.mode !== "script") {
        throw new Error("CREATIVE_COPY_MODE_INVALID");
      }
      if (!body.organizationId?.trim() || !body.projectId?.trim()) {
        throw new Error("TENANT_SCOPE_REQUIRED");
      }
      if (!body.productBrief || (typeof body.productBrief === "string" && !body.productBrief.trim())) {
        throw new Error("PRODUCT_BRIEF_REQUIRED");
      }
      if (!body.strategy || typeof body.strategy !== "object" || Array.isArray(body.strategy)) {
        throw new Error("STRATEGY_CONTEXT_REQUIRED");
      }

      const registry = new AgentRegistry();
      const provider = new AnthropicProvider(apiKey);
      registry.register(createModelBackedCreativeCopyAgent({ provider, model, mode: body.mode }));
      const runtime = new AgentRuntime(registry);
      const agentId = body.mode === "hooks" ? "creative-hooks-ai" : "creative-script-ai";
      const envelope: ExecutionEnvelope = {
        execution: {
          runId: `creative-copy:${randomUUID()}`,
          agentId,
          agentVersion: "1.0.0",
          attempt: 1,
          requestedAt: new Date().toISOString(),
        },
        context: { organizationId: body.organizationId, projectId: body.projectId },
        task: {
          objective: body.objective?.trim() || (body.mode === "hooks"
            ? "Generate distinct direct-response advertising hooks."
            : "Write a concise, demonstrable direct-response video script."),
          constraints: [
            "Use only facts supported by the product brief and strategy context.",
            "Do not invent testimonials, statistics, certifications, guarantees, or product capabilities.",
            "Keep output suitable for human review; do not publish or launch campaigns.",
          ],
          instructions: [],
        },
        inputs: { productBrief: body.productBrief, strategy: body.strategy },
        knowledge: [],
        memory: [],
        tools: [],
      };
      const result = await runtime.execute(envelope);
      json(response, 200, {
        status: result.status,
        result: result.result,
        warnings: result.warnings,
        approvalRequired: true,
        externalActionsPerformed: false,
      });
    } catch (error) {
      json(response, 400, {
        error: error instanceof Error ? error.message : "Invalid creative copy request",
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/v1/strategy/generate") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL;
    if (!apiKey || !model) {
      json(response, 503, {
        error: "MODEL_PROVIDER_NOT_CONFIGURED",
        requiredEnvironment: ["ANTHROPIC_API_KEY", "ANTHROPIC_MODEL"],
      });
      return;
    }
    try {
      const raw = await readBody(request);
      const body = (raw ? JSON.parse(raw) : {}) as {
        organizationId?: string;
        projectId?: string;
        productBrief?: Record<string, unknown> | string;
        objective?: string;
        constraints?: string[];
      };
      const result = await generateStrategy({
        organizationId: body.organizationId ?? "",
        projectId: body.projectId ?? "",
        productBrief: body.productBrief ?? "",
        objective: body.objective,
        constraints: body.constraints,
      }, { apiKey, model });
      json(response, 200, {
        status: result.status,
        result: result.result,
        warnings: result.warnings,
        approvalRequired: true,
        externalActionsPerformed: false,
      });
    } catch (error) {
      json(response, 400, {
        error: error instanceof Error ? error.message : "Invalid strategy request",
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/v1/demo/runs") {
    try {
      const raw = await readBody(request);
      const body = (raw ? JSON.parse(raw) : {}) as {
        product?: Parameters<typeof runDemo>[0];
        overrides?: Parameters<typeof runDemo>[1];
      };
      const run = await runDemo(body.product, body.overrides);
      demoRuns.set(run.summary.runId, run);
      json(response, 201, run.summary);
    } catch (error) {
      json(response, 400, { error: error instanceof Error ? error.message : "Invalid demo request" });
    }
    return;
  }

  const demoMatch = url.pathname.match(/^\/v1\/demo\/runs\/([^/]+)$/);
  if (request.method === "GET" && demoMatch) {
    const run = demoRuns.get(decodeURIComponent(demoMatch[1]));
    if (!run) {
      json(response, 404, { error: "RUN_NOT_FOUND" });
      return;
    }
    json(response, 200, run.summary);
    return;
  }

  if (request.method === "POST" && url.pathname === "/v1/intelligence/actions") {
    try {
      const raw = await readBody(request);
      const body = (raw ? JSON.parse(raw) : {}) as Partial<IntelligenceActionsRequest>;
      const tenant = body.tenant;
      if (!tenant) throw new Error("tenant.organizationId is required");
      const actions = application.getIntelligenceActions({ tenant, signals: body.signals ?? {} });
      json(response, 200, { actions });
    } catch (error) {
      json(response, 400, { error: error instanceof Error ? error.message : "Invalid request" });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/v1/autonomous/run") {
    try {
      const raw = await readBody(request);
      const body = (raw ? JSON.parse(raw) : {}) as AutonomousRunRequest;
      if (!body.tenant || !body.input) throw new Error("tenant and input are required");
      const result = await application.runAutonomous(body);
      json(response, 200, result);
    } catch (error) {
      json(response, 400, { error: error instanceof Error ? error.message : "Invalid autonomous request" });
    }
    return;
  }

  json(response, 404, { error: "Not found" });
}

const server = createServer((request, response) => {
  void handler(request, response).catch((error: unknown) => {
    json(response, 500, { error: error instanceof Error ? error.message : "Internal server error" });
  });
});

server.listen(port, () => {
  console.log(`ATLAS API listening on http://localhost:${port}`);
});

process.once("SIGINT", () => server.close(() => process.exit(0)));
process.once("SIGTERM", () => server.close(() => process.exit(0)));
