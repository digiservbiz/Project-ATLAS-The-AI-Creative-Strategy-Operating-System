import {
  AtlasAutonomousLoop,
  AtlasOperatingLoop,
  IntelligenceAwareOrchestrator,
  PerformanceIntelligenceIngestion,
} from "@atlas/automation";
import {
  InMemoryIntelligenceRepository,
  PersistentIntelligenceService,
  type CreativeDNA,
} from "@atlas/intelligence";
import type { AgentContext, AgentResult, AgentSkill } from "../../packages/orchestrator/src/contracts.js";
import { ProductUrlAnalyzer, type ProductPage, type ProductPageFetcher } from "../../packages/creative-intelligence/src/product-url.js";
import type { AtlasApplication } from "./application.js";
import { createAtlasApplication } from "./application.js";

export interface LocalProductCatalogEntry {
  title: string;
  description: string;
  price: string;
  currency: string;
  image: string;
}

const DEFAULT_PRODUCT: LocalProductCatalogEntry = {
  title: "ATLAS Demo Product",
  description:
    "Premium everyday product designed for busy customers. Easy to use, fast to adopt, premium quality, and built to save time.",
  price: "49",
  currency: "USD",
  image: "https://example.local/atlas-demo-product.jpg",
};

/** Network-free product fetcher used by the local development composition. */
export class LocalProductPageFetcher implements ProductPageFetcher {
  constructor(private readonly catalog: Map<string, LocalProductCatalogEntry> = new Map()) {}

  async fetch(url: string): Promise<ProductPage> {
    const entry = this.catalog.get(url) ?? DEFAULT_PRODUCT;
    return {
      url,
      canonicalUrl: url,
      title: entry.title,
      description: entry.description,
      price: entry.price,
      currency: entry.currency,
      images: [entry.image],
      text: `${entry.title}\n${entry.description}`,
    };
  }
}

class LocalCreativeRepository {
  private readonly records = new Map<string, CreativeDNA>();

  async get(businessId: string, creativeId: string): Promise<CreativeDNA | null> {
    const key = `${businessId}:${creativeId}`;
    const existing = this.records.get(key);
    if (existing) return structuredClone(existing);

    const dna: CreativeDNA = {
      id: creativeId,
      businessId,
      hook: "Local test hook",
      angle: "Benefit-led",
      problem: "The customer needs a simpler solution.",
      desire: "Save time and get a reliable result.",
      emotion: "relief",
      mechanism: "A simple product workflow",
      promise: "Make the task easier.",
      offer: "Demo offer",
      cta: "Try it",
      visualConcept: "Clean product demonstration",
      format: "static",
      platform: "meta",
      archetype: "demonstration",
      evidenceIds: [],
      confidence: 0.5,
      createdAt: new Date().toISOString(),
    };
    this.records.set(key, dna);
    return structuredClone(dna);
  }
}

class LocalExecutionSkill implements AgentSkill {
  readonly skillId = "atlas:execution";

  async execute(context: AgentContext): Promise<AgentResult> {
    const strategy = context.inputs.strategyPack as { businessId?: string; creativeBriefs?: unknown[] } | undefined;
    return {
      output: {
        mode: "local",
        businessId: strategy?.businessId,
        creativeBriefCount: strategy?.creativeBriefs?.length ?? 0,
        message: "Deterministic local execution completed without external spend or account-state actions.",
      },
      decisions: ["Local execution is simulation-only; no external ad, commerce, or publishing action was performed."],
    };
  }
}

export interface LocalAtlasComposition {
  application: AtlasApplication;
  autonomousLoop: AtlasAutonomousLoop;
  intelligence: PersistentIntelligenceService;
}

/**
 * Builds the complete offline ATLAS vertical slice for local testing.
 * Production providers are intentionally not silently substituted here.
 */
export function createLocalAtlasComposition(): LocalAtlasComposition {
  const repository = new InMemoryIntelligenceRepository();
  const intelligence = new PersistentIntelligenceService({ repository });
  const creatives = new LocalCreativeRepository();
  const performanceIngestion = new PerformanceIntelligenceIngestion(creatives, intelligence);
  const orchestrator = new IntelligenceAwareOrchestrator([new LocalExecutionSkill()], {
    research: "atlas:execution",
    audience_research: "atlas:execution",
    creative_test: "atlas:execution",
    offer_optimization: "atlas:execution",
    landing_page_optimization: "atlas:execution",
    competitive_research: "atlas:execution",
    market_research: "atlas:execution",
    analysis: "atlas:execution",
    retention: "atlas:execution",
  });
  const analyzer = new ProductUrlAnalyzer(new LocalProductPageFetcher());
  const operatingLoop = new AtlasOperatingLoop({ analyzer, orchestrator, performanceIngestion, intelligence });
  const autonomousLoop = new AtlasAutonomousLoop(operatingLoop);

  return {
    application: createAtlasApplication({ autonomousLoop }),
    autonomousLoop,
    intelligence,
  };
}
