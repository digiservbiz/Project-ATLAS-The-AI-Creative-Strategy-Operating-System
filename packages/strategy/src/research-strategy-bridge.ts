import type { ResearchInsight } from "@atlas/research";

export interface ResearchStrategyInput {
  objective: string;
  productId: string;
  insights: ResearchInsight[];
}

export interface ResearchStrategySignals {
  positioning: string[];
  audiences: string[];
  angles: string[];
  hooks: string[];
  objections: string[];
  claims: string[];
  confidence: number;
  evidenceIds: string[];
}

export class ResearchStrategyBridge {
  build(input: ResearchStrategyInput): ResearchStrategySignals {
    const insights = input.insights.filter((i) => i.freshness === "fresh");
    const confidence = insights.length
      ? insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length
      : 0;

    const positioning: string[] = [];
    const audiences: string[] = [];
    const angles: string[] = [];
    const hooks: string[] = [];
    const objections: string[] = [];
    const claims: string[] = [];

    for (const insight of insights) {
      const subject = insight.subject;
      const claim = insight.claim;
      if (insight.category === "competitor") angles.push(`Differentiate against: ${subject}`);
      if (insight.category === "customer") {
        audiences.push(subject);
        hooks.push(`Speak directly to: ${claim}`);
        objections.push(...insight.recommendations);
      }
      if (insight.category === "market") positioning.push(`Position within the market signal: ${claim}`);
      if (insight.category === "product") claims.push(claim);
      if (insight.category === "creative") angles.push(`Test creative pattern: ${claim}`);
    }

    if (!positioning.length) positioning.push(`Research-backed positioning for ${input.productId}`);
    if (!angles.length) angles.push("Generate angles from validated research signals");
    if (!hooks.length) hooks.push("Generate hooks from recurring customer language");

    return {
      positioning,
      audiences: [...new Set(audiences)],
      angles: [...new Set(angles)],
      hooks: [...new Set(hooks)],
      objections: [...new Set(objections)],
      claims: [...new Set(claims)],
      confidence,
      evidenceIds: [...new Set(insights.flatMap((i) => i.evidenceIds))],
    };
  }
}
