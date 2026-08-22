import { describe, expect, it } from "vitest";
import { CreativeProviderRouter, type CreativeProvider } from "./provider";

describe("CreativeProviderRouter", () => {
  it("routes image and video jobs to capable providers", async () => {
    const image: CreativeProvider = { name: "image-provider", supports: (kind) => kind === "image", async generate(request) { return { jobId: request.jobId, status: "completed", assetUrl: "https://cdn/image.png" }; } };
    const video: CreativeProvider = { name: "video-provider", supports: (kind) => kind === "video", async generate(request) { return { jobId: request.jobId, status: "completed", assetUrl: "https://cdn/video.mp4" }; } };
    const router = new CreativeProviderRouter([image, video]);
    expect((await router.generate({ jobId: "i1", kind: "image", prompt: "product hero", aspectRatio: "4:5" })).assetUrl).toContain("image");
    expect((await router.generate({ jobId: "v1", kind: "video", prompt: "UGC demo", aspectRatio: "9:16" })).assetUrl).toContain("video");
  });

  it("fails clearly when no provider supports the requested kind", async () => {
    const router = new CreativeProviderRouter([]);
    await expect(router.generate({ jobId: "v1", kind: "video", prompt: "demo", aspectRatio: "9:16" })).rejects.toThrow("No creative provider supports video");
  });
});
