import { describe, expect, it } from "vitest";
import { buildStrategyPack } from "./strategy-pack";
import type { ProductAnalysis } from "./product-url";
import type { CreativeBrief } from "./creative-production";
import type { IntelligenceSnapshot } from "@atlas/intelligence";

const analysis = {
  product: { url: "https://example.com/product", title: "Demo Product", images: [], text: "" },
  valuePropositions: ["Save time"],
  likelyAudience: ["Busy professionals"],
  objections: ["price"],
  creativeAngles: ["problem → solution"],
} as ProductAnalysis;

const brief: CreativeBrief = {
  angle: "problem → solution",
  hook: "Save time",
  format: "video",
  aspectRatio: "9:16",
  prompt: "Show the product solving a real problem",
  destinationUrl: analysis.product.url,
};

const snapshot = {
  business: { business: { id: "business-1" } },
  state: { businessId: "business-1" },
  nextBestActions: [{ id: "nba-1", reason: "Test a new angle", confidence: 0.88, requiredApproval: false }],
} as unknown as IntelligenceSnapshot;

describe("buildStrategyPack", () => {
  it("combines product analysis, creative briefs, and the top intelligence action", () => {
    const pack = buildStrategyPack(analysis, snapshot, [brief]);
    expect(pack.businessId).toBe("business-1");
    expect(pack.positioning).toEqual(["Save time"]);
    expect(pack.audience).toEqual(["Busy professionals"]);
    expect(pack.intelligence).toEqual({
      nextBestActionId: "nba-1",
      nextBestActionReason: "Test a new angle",
      confidence: 0.88,
      requiresApproval: false,
    });
    expect(pack.creativeBriefs).toHaveLength(1);
  });

  it("rejects a snapshot whose business and state disagree", () => {
    expect(() => buildStrategyPack(analysis, {
      ...snapshot,
      business: { business: { id: "business-2" } },
    } as unknown as IntelligenceSnapshot, [brief])).toThrow("business/state scope mismatch");
  });
});
