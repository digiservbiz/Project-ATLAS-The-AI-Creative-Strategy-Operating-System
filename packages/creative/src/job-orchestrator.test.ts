import { describe, expect, it } from "vitest";
import { CreativeJobOrchestrator, type CreativeJob } from "./job-orchestrator";
import { CreativeProviderRouter } from "./provider";

describe("CreativeJobOrchestrator", () => {
  it("tracks a generation job through completion", async () => {
    const jobs = new Map<string, CreativeJob>();
    const router = new CreativeProviderRouter([{ name: "mock", supports: () => true, async generate(request) { return { jobId: request.jobId, status: "completed", assetUrl: "https://cdn/asset" }; } }]);
    const orchestrator = new CreativeJobOrchestrator(router, { async save(job) { jobs.set(job.id, { ...job }); }, async get(id) { return jobs.get(id); } });
    const job = await orchestrator.submit({ jobId: "job-1", kind: "video", prompt: "UGC demo", aspectRatio: "9:16" });
    expect(job.status).toBe("completed");
    expect(job.result?.assetUrl).toBe("https://cdn/asset");
  });

  it("records provider failures", async () => {
    const router = new CreativeProviderRouter([{ name: "broken", supports: () => true, async generate() { throw new Error("provider unavailable"); } }]);
    const jobs = new Map<string, CreativeJob>();
    const orchestrator = new CreativeJobOrchestrator(router, { async save(job) { jobs.set(job.id, { ...job }); }, async get(id) { return jobs.get(id); } });
    const job = await orchestrator.submit({ jobId: "job-2", kind: "image", prompt: "hero", aspectRatio: "4:5" });
    expect(job.status).toBe("failed");
    expect(job.result?.error).toContain("provider unavailable");
  });
});
