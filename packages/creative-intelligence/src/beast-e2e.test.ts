import { describe, expect, it } from "vitest";
import { ProductUrlAnalyzer, type ProductPage } from "./product-url";
import { CreativeProductionPlanner } from "./creative-production";
import { buildStrategyPack } from "./strategy-pack";
import { processPerformanceOutcome, type CreativeDNA } from "@atlas/intelligence";
import type { IntelligenceSnapshot } from "@atlas/intelligence";

const BUSINESS_ID = "beast-business";
const PRODUCT_URL = "https://example.com/products/time-saver";

class FakeProductFetcher {
  async fetch(url: string): Promise<ProductPage> {
    return {
      url,
      title: "Time Saver",
      description: "Save time with a simple tool designed for busy professionals.",
      price: "49",
      currency: "EUR",
      images: ["https://example.com/time-saver.jpg"],
      canonicalUrl: url,
      text: "Save time. Easy to use. Designed for busy professionals. Premium quality.",
    };
  }
}

const snapshot = {
  business: { business: { id: BUSINESS_ID } },
  state: { businessId: BUSINESS_ID },
  nextBestActions: [
    {
      id: "nba-test-angle",
      reason: "Test a new creative angle",
      confidence: 0.9,
      requiredApproval: false,
    },
  ],
} as unknown as IntelligenceSnapshot;

const dna: CreativeDNA = {
  id: "creative-beast-001",
  businessId: BUSINESS_ID,
  hook: "Save time",
  angle: "problem → solution",
  problem: "Busy professionals lose time on repetitive work",
  desire: "Get more done with less effort",
  promise: "Save time with a simple tool",
  format: "video",
  platform: "meta",
  archetype: "problem_solution",
  evidenceIds: ["product:beast-001"],
  confidence: 0.8,
  createdAt: "2026-09-03T00:00:00.000Z",
};

describe("ATLAS Beast E2E", () => {
  it("runs product → strategy → creative → performance → learning as one loop", async () => {
    // 1. Product intake: URL becomes structured product intelligence.
    const analysis = await new ProductUrlAnalyzer(new FakeProductFetcher()).analyze(PRODUCT_URL);
    expect(analysis.product.title).toBe("Time Saver");
    expect(analysis.valuePropositions.length).toBeGreaterThan(0);
    expect(analysis.likelyAudience.length).toBeGreaterThan(0);

    // 2. Creative planning: intelligence becomes executable creative briefs.
    const briefs = new CreativeProductionPlanner().plan(analysis);
    expect(briefs.length).toBeGreaterThanOrEqual(2);
    expect(briefs.some((brief) => brief.format === "video" && brief.aspectRatio === "9:16")).toBe(true);

    // 3. Strategy: product intelligence + creative plan + ATLAS decision are unified.
    const strategy = buildStrategyPack(analysis, snapshot, briefs);
    expect(strategy.businessId).toBe(BUSINESS_ID);
    expect(strategy.intelligence.nextBestActionId).toBe("nba-test-angle");
    expect(strategy.angles.length).toBeGreaterThan(0);

    // 4. Simulated platform outcome: strong performance becomes canonical learning.
    const outcome = processPerformanceOutcome(dna, {
      creativeId: dna.id,
      businessId: BUSINESS_ID,
      platform: "meta",
      period: { start: "2026-09-01", end: "2026-09-03" },
      impressions: 10000,
      clicks: 500,
      spend: 100,
      conversions: 20,
      revenue: 400,
      evidenceIds: ["meta:insights:beast-001"],
    });

    expect(outcome.creative.performance?.roas).toBe(4);
    expect(outcome.creative.performance?.ctr).toBe(0.05);
    expect(outcome.learning?.status).toBe("supported");
    expect(outcome.learning?.businessId).toBe(BUSINESS_ID);
    expect(outcome.learning?.evidenceIds).toContain("meta:insights:beast-001");
  });

  it("detects a weak creative outcome instead of treating every result as a win", async () => {
    const analysis = await new ProductUrlAnalyzer(new FakeProductFetcher()).analyze(PRODUCT_URL);
    const strategy = buildStrategyPack(analysis, snapshot, new CreativeProductionPlanner().plan(analysis));

    const outcome = processPerformanceOutcome(dna, {
      creativeId: dna.id,
      businessId: strategy.businessId,
      platform: "meta",
      period: { start: "2026-09-01", end: "2026-09-03" },
      impressions: 5000,
      clicks: 20,
      spend: 100,
      conversions: 1,
      revenue: 50,
      evidenceIds: ["meta:insights:beast-weak-001"],
    });

    expect(outcome.creative.performance?.roas).toBe(0.5);
    expect(outcome.learning?.status).toBe("rejected");
    expect(outcome.learning?.statement).toContain("underperforms");
  });
});
