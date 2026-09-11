import { describe, expect, it } from "vitest";
import {
  buildIntelligenceSnapshot,
  createBusinessIntelligenceModel,
  createStrategicState,
  type CreativeDNA,
  type PersistentIntelligenceService,
} from "@atlas/intelligence";
import type { AgentContext, AgentResult, AgentSkill } from "@atlas/orchestrator";
import { ProductUrlAnalyzer, type ProductPageFetcher } from "../../creative-intelligence/src/product-url";
import { AtlasOperatingLoop } from "./atlas-operating-loop";
import { PerformanceIntelligenceIngestion, type CreativeDNARepository } from "./performance-intelligence-ingestion";
import { IntelligenceAwareOrchestrator } from "./intelligence-aware-orchestrator";

const business = createBusinessIntelligenceModel({
  business: {
    id: "business-1",
    name: "Atlas Demo",
    model: "ecommerce",
    markets: ["US"],
    channels: ["meta"],
    brandIds: ["brand-1"],
  },
  brands: [{ id: "brand-1", businessId: "business-1", name: "Atlas Demo", positioning: "Simple performance creative" }],
  offers: [{ id: "offer-1", businessId: "business-1", name: "Demo Product", type: "product", valueProposition: "Easy and fast" }],
  audiences: [{ id: "audience-1", businessId: "business-1", name: "Busy buyers", problems: ["time"], desires: ["speed"], objections: ["price"] }],
  competitors: [],
  campaigns: [],
});

const snapshot = buildIntelligenceSnapshot(business, createStrategicState(business, "Launch a winning creative test"));

const productFetcher: ProductPageFetcher = {
  async fetch(url) {
    return {
      url,
      title: "Fast premium demo product",
      description: "Save time with an easy product designed for busy buyers.",
      images: ["https://example.com/product.jpg"],
      text: "Premium quality and easy to use.",
    };
  },
};

class ExecutionSkill implements AgentSkill {
  skillId = "atlas:execution";
  async execute(context: AgentContext): Promise<AgentResult> {
    return {
      summary: "Creative execution completed",
      data: context.inputs.strategyPack,
      requiresApproval: false,
    };
  }
}

const dna: CreativeDNA = {
  id: "creative-1",
  businessId: "business-1",
  hook: "Save time",
  angle: "problem → solution",
  format: "image",
  platform: "meta",
  archetype: "problem_solution",
  evidenceIds: [],
  confidence: 0.8,
  createdAt: "2026-09-01T00:00:00.000Z",
};

class MemoryIntelligence {
  learning: unknown[] = [];
  dna: CreativeDNA | null = null;

  async recordCreativeDNA(value: CreativeDNA) {
    this.dna = value;
    return { id: value.id, businessId: value.businessId, entityType: "creative_dna", version: 1, data: value, evidenceIds: value.evidenceIds, createdAt: value.createdAt, updatedAt: value.createdAt };
  }

  async ingestLearning(current: typeof snapshot, learning: unknown) {
    this.learning.push(learning);
    return {
      ...current,
      state: { ...current.state, knownLearnings: [...current.state.knownLearnings, "performance learning"] },
    };
  }
}

describe("AtlasOperatingLoop beast path", () => {
  it("runs product intelligence → strategy → execution → performance → learning → next decision", async () => {
    const intelligence = new MemoryIntelligence();
    const creativeRepository: CreativeDNARepository = {
      async get(businessId, creativeId) {
        return businessId === dna.businessId && creativeId === dna.id ? structuredClone(dna) : null;
      },
    };
    const performanceIngestion = new PerformanceIntelligenceIngestion(
      creativeRepository,
      intelligence as unknown as PersistentIntelligenceService,
    );
    const orchestrator = new IntelligenceAwareOrchestrator([new ExecutionSkill()]);
    const operatingLoop = new AtlasOperatingLoop({
      analyzer: new ProductUrlAnalyzer(productFetcher),
      orchestrator,
      performanceIngestion,
      intelligence: intelligence as unknown as PersistentIntelligenceService,
    });

    const result = await operatingLoop.run({
      runId: "beast-run",
      productUrl: "https://example.com/product",
      organizationId: "org-1",
      projectId: "project-1",
      snapshot,
      workflowSteps: [{ id: "execute", skillId: "atlas:execution" }],
      performance: {
        creativeId: "creative-1",
        businessId: "business-1",
        platform: "meta",
        period: { start: "2026-09-01", end: "2026-09-07" },
        impressions: 1000,
        clicks: 50,
        spend: 100,
        conversions: 10,
        revenue: 400,
        evidenceIds: ["meta:event-1"],
      },
    });

    expect(result.analysis.product.title).toContain("premium");
    expect(result.briefs.length).toBeGreaterThan(0);
    expect(result.strategy.businessId).toBe("business-1");
    expect(result.workflow.status).toBe("completed");
    expect(result.performance?.learning?.status).toBe("supported");
    expect(result.performance?.performance.roas).toBe(4);
    expect(intelligence.dna?.performance?.roas).toBe(4);
    expect(intelligence.learning).toHaveLength(1);
    expect(result.nextSnapshot.state.knownLearnings).toContain("performance learning");
  });
});
