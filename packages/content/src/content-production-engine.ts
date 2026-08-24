export type ContentFormat = "social_post" | "reel" | "tiktok" | "short" | "youtube" | "blog" | "email" | "landing_page" | "ad" | "ugc";
export type ContentPillar = "educational" | "promotional" | "proof" | "story" | "community" | "evergreen";

export interface ContentRequest { id: string; goal: string; audience: string; formats: ContentFormat[]; pillars?: ContentPillar[]; quantity: number; sourceStrategyId?: string; brandContext?: Record<string, unknown>; }
export interface ContentPiece { id: string; format: ContentFormat; pillar: ContentPillar; title: string; hook: string; body: string; cta?: string; visualDirection?: string; sourceRequestId: string; }
export interface ContentPlanner { plan(request: ContentRequest): Promise<ContentPiece[]>; }
export interface ContentRenderer { render(piece: ContentPiece): Promise<{ assetId: string; assetUrl?: string; metadata?: Record<string, unknown> }>; }
export interface ContentValidator { validate(piece: ContentPiece, asset?: unknown): Promise<{ passed: boolean; issues: string[] }>; }

export class ContentProductionEngine {
  constructor(private readonly planner: ContentPlanner, private readonly renderer: ContentRenderer, private readonly validator: ContentValidator) {}

  async produce(request: ContentRequest) {
    if (!request.formats.length) throw new Error("At least one content format is required");
    if (request.quantity < 1) throw new Error("Content quantity must be at least one");
    const pieces = await this.planner.plan(request);
    const selected = pieces.slice(0, request.quantity);
    const results = [];
    for (const piece of selected) {
      const validation = await this.validator.validate(piece);
      if (!validation.passed) { results.push({ piece, validation, status: "rejected" as const }); continue; }
      const asset = await this.renderer.render(piece);
      const renderedValidation = await this.validator.validate(piece, asset);
      results.push({ piece, asset, validation: renderedValidation, status: renderedValidation.passed ? "ready_for_review" as const : "rejected" as const });
    }
    return { request, results };
  }

  static repurpose(source: ContentPiece, formats: ContentFormat[], requestId = `repurpose:${source.id}`): ContentPiece[] {
    return formats.map((format, index) => ({ ...source, id: `${requestId}:${index + 1}`, format, sourceRequestId: requestId, title: `${source.title} — ${format}` }));
  }
}
