export type CreativeFormat = "image" | "video";
export interface CreativeBrief { id: string; format: CreativeFormat; hook: string; message: string; audience: string; offer?: string; visualDirection: string; callToAction: string; sourceStrategyId: string; }
export interface CreativeGenerator { generate(brief: CreativeBrief): Promise<{ assetId: string; url?: string; metadata?: Record<string, unknown> }>; }
export interface CreativeQA { check(asset: { assetId: string; url?: string; metadata?: Record<string, unknown> }, brief: CreativeBrief): Promise<{ passed: boolean; issues: string[] }>; }

export class CreativePipeline {
  constructor(private readonly generator: CreativeGenerator, private readonly qa: CreativeQA) {}

  async generateAndCheck(briefs: CreativeBrief[]) {
    const results = [];
    for (const brief of briefs) {
      const asset = await this.generator.generate(brief);
      const quality = await this.qa.check(asset, brief);
      results.push({ brief, asset, quality, status: quality.passed ? "approved_for_review" : "rejected" });
    }
    return results;
  }
}
