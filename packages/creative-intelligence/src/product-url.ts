export interface ProductPage { url: string; title?: string; description?: string; price?: string; currency?: string; images: string[]; canonicalUrl?: string; text: string; }
export interface ProductPageFetcher { fetch(url: string): Promise<ProductPage>; }
export interface ProductAnalysis { product: ProductPage; valuePropositions: string[]; likelyAudience: string[]; objections: string[]; creativeAngles: string[]; }

export class ProductUrlAnalyzer {
  constructor(private readonly fetcher: ProductPageFetcher) {}

  async analyze(url: string): Promise<ProductAnalysis> {
    if (!/^https?:\/\//i.test(url)) throw new Error("A valid product URL is required");
    const product = await this.fetcher.fetch(url);
    const text = [product.title, product.description, product.text].filter(Boolean).join("\n");
    return {
      product,
      valuePropositions: extractSignals(text, ["benefit", "feature", "save", "easy", "fast", "premium"]),
      likelyAudience: extractSignals(text, ["for", "designed for", "perfect for", "ideal for"]),
      objections: ["price", "trust", "quality", "shipping", "fit"],
      creativeAngles: ["problem → solution", "product demonstration", "benefit-led", "social proof", "offer/urgency"],
    };
  }
}

function extractSignals(text: string, keywords: string[]): string[] {
  const lines = text.split(/\n|[.!?]/).map((line) => line.trim()).filter(Boolean);
  return lines.filter((line) => keywords.some((keyword) => line.toLowerCase().includes(keyword))).slice(0, 8);
}
