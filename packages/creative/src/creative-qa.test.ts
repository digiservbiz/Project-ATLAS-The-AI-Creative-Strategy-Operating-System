import { describe, expect, it } from "vitest";
import { CreativeQaEngine } from "./creative-qa";
import type { CreativeJob } from "./job-orchestrator";

const completed: CreativeJob = { id: "job-1", status: "completed", request: { jobId: "job-1", kind: "image", prompt: "hero", aspectRatio: "4:5" }, result: { jobId: "job-1", status: "completed", assetUrl: "https://cdn/hero.png" }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

describe("CreativeQaEngine", () => {
  it("approves a completed job with an asset", () => expect(new CreativeQaEngine().evaluate(completed).decision).toBe("approved"));
  it("requires review when the asset is missing", () => expect(new CreativeQaEngine().evaluate({ ...completed, result: { jobId: "job-1", status: "completed" } }).decision).toBe("needs_review"));
});
