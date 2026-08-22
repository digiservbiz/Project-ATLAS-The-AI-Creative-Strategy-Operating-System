import type { ExtractedProductFacts, ProductFactExtractor } from "./profile-extraction";
import type { ProductSource } from "./product-input";

export interface UrlFetcher { fetch(url: string): Promise<{ text: string; images?: string[]; metadata?: Record<string, unknown> }>; }
export interface ImageAnalyzer { analyze(assetUrl: string): Promise<{ description?: string; visibleText?: string[]; productSignals?: string[] }>; }
export interface DocumentExtractor { extract(assetUrl: string, mimeType?: string): Promise<{ text: string; metadata?: Record<string, unknown> }>; }

export class SourceFactExtractor implements ProductFactExtractor {
  constructor(private readonly url: UrlFetcher, private readonly image: ImageAnalyzer, private readonly document: DocumentExtractor) {}

  async extract(source: ProductSource): Promise<ExtractedProductFacts> {
    if (source.type === "url") {
      const page = await this.url.fetch(source.locator);
      return { sourceId: source.id, description: page.text, ...(page.metadata as Partial<ExtractedProductFacts>) };
    }
    if (source.type === "image") {
      const result = await this.image.analyze(source.locator);
      return { sourceId: source.id, description: result.description, features: result.productSignals, creativeAngles: result.visibleText?.map((text) => `Use visible product claim: ${text}`) };
    }
    const result = await this.document.extract(source.locator, source.metadata?.mimeType as string | undefined);
    return { sourceId: source.id, description: result.text, ...(result.metadata as Partial<ExtractedProductFacts>) };
  }
}
