import { describe, expect, it } from "vitest";
import { evaluateCreativeArtifact } from "./evaluation";
import type { CreativeArtifact } from "@atlas/contracts";

const base: CreativeArtifact = {
  id: "creative-1",
  organizationId: "org-1",
  source: {
    source: "authorized_custom",
    sourceId: "source-1",
    capturedAt: "2026-08-20T00:00:00Z",
  },
  primaryText: "Install this product without drilling or damaging your wall.",
  callToAction: "Shop Now",
  landingPageUrl: "https://example.com/product",
  mediaUrls: ["https://example.com/video.mp4"],
};

describe("evaluateCreativeArtifact", () => {
  it("accepts a complete high-quality artifact", () => {
    const result = evaluateCreativeArtifact(base);
    expect(result.accepted).toBe(true);
    expect(result.qualityScore).toBeGreaterThanOrEqual(0.6);
  });

  it("rejects invalid artifacts", () => {
    const result = evaluateCreativeArtifact({
      ...base,
      id: "",
      primaryText: undefined,
      headline: undefined,
      title: undefined,
      description: undefined,
    });
    expect(result.accepted).toBe(false);
    expect(result.validation.valid).toBe(false);
  });

  it("supports a stricter minimum score", () => {
    const result = evaluateCreativeArtifact(base, { minimumQualityScore: 0.95 });
    expect(result.accepted).toBe(false);
  });
});
