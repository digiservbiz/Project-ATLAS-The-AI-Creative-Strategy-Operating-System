import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createAtlasApplication, type IntelligenceActionsRequest, type AutonomousRunRequest } from "./application.js";
import { createLocalAtlasComposition } from "./local-composition.js";
import { runDemo, type DemoRun } from "@atlas/demo-runner";

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
